"""
Case Study 04: Race Condition & Atomic Stock Allocation
PT Steel Pipe Industry of Indonesia Tbk (SPINDO) - Backend Track
"""
from dataclasses import dataclass
from typing import Dict, Any, Optional
import threading


# 1. Custom Exceptions
class InventoryAllocationError(Exception):
    """Base exception for inventory allocation domain."""
    pass


class InsufficientStockError(InventoryAllocationError):
    """Raised when available stock is less than requested quantity."""
    pass


class ProductNotFoundError(InventoryAllocationError):
    """Raised when requested SKU does not exist in inventory."""
    pass


# 2. Domain Model / Entity
@dataclass
class PipeInventory:
    sku: str
    pipe_type: str
    total_stock: int
    reserved_stock: int = 0

    @property
    def available_stock(self) -> int:
        return self.total_stock - self.reserved_stock


# 3. Transaction & Session Simulator (Thread-Safe with Pessimistic Row Lock simulation)
class MockDatabaseSession:
    """
    Thread-safe in-memory session supporting row locking, commit, and rollback.
    Implements the core transaction mechanics of SQLAlchemy/SQLModel.
    """
    def __init__(self, data_store: Dict[str, PipeInventory]):
        self._store = data_store
        self._lock = threading.RLock()
        self._pending_mutations: Dict[str, PipeInventory] = {}
        self._in_transaction = True

    def find_by_sku_with_lock(self, sku: str) -> Optional[PipeInventory]:
        """Simulates SELECT ... WHERE sku = :sku FOR UPDATE"""
        self._lock.acquire()
        if sku not in self._store:
            return None
        # Return a working copy so rollback can restore pristine state
        item = self._store[sku]
        working_copy = PipeInventory(
            sku=item.sku,
            pipe_type=item.pipe_type,
            total_stock=item.total_stock,
            reserved_stock=item.reserved_stock
        )
        self._pending_mutations[sku] = working_copy
        return working_copy

    def add(self, inventory: PipeInventory) -> None:
        self._pending_mutations[inventory.sku] = inventory

    def commit(self) -> None:
        """Applies pending mutations to main datastore and releases locks."""
        for sku, item in self._pending_mutations.items():
            self._store[sku] = item
        self._pending_mutations.clear()
        if self._lock._is_owned():
            self._lock.release()

    def rollback(self) -> None:
        """Discards pending mutations and releases row locks."""
        self._pending_mutations.clear()
        if self._lock._is_owned():
            self._lock.release()

    def refresh(self, inventory: PipeInventory) -> None:
        if inventory.sku in self._store:
            actual = self._store[inventory.sku]
            inventory.total_stock = actual.total_stock
            inventory.reserved_stock = actual.reserved_stock


# 4. Atomic Allocation Business Logic
def allocate_pipe_stock(
    session: MockDatabaseSession,
    order_id: str,
    pipe_sku: str,
    qty_requested: int
) -> Dict[str, Any]:
    """
    Atomically allocates pipe stock using pessimistic row locking to prevent race conditions.
    """
    if qty_requested <= 0:
        return {
            "status": "FAILED",
            "order_id": order_id,
            "sku": pipe_sku,
            "reason": "Quantity requested must be greater than zero."
        }

    try:
        # Step 1: Query with Pessimistic Lock (SELECT FOR UPDATE)
        inventory = session.find_by_sku_with_lock(pipe_sku)
        if not inventory:
            raise ProductNotFoundError(f"Pipe with SKU '{pipe_sku}' not found.")

        # Step 2: Validate available stock
        if inventory.available_stock < qty_requested:
            raise InsufficientStockError(
                f"Insufficient stock for {pipe_sku}. "
                f"Requested: {qty_requested}, Available: {inventory.available_stock}"
            )

        # Step 3: Mutate reserved stock
        inventory.reserved_stock += qty_requested
        session.add(inventory)
        session.commit()
        session.refresh(inventory)

        return {
            "status": "SUCCESS",
            "order_id": order_id,
            "sku": pipe_sku,
            "allocated_qty": qty_requested,
            "remaining_available_stock": inventory.available_stock
        }

    except (InsufficientStockError, ProductNotFoundError) as e:
        session.rollback()
        return {
            "status": "FAILED",
            "order_id": order_id,
            "sku": pipe_sku,
            "reason": str(e)
        }
    except Exception as e:
        session.rollback()
        return {
            "status": "ERROR",
            "order_id": order_id,
            "sku": pipe_sku,
            "reason": f"Unexpected database error: {str(e)}"
        }
