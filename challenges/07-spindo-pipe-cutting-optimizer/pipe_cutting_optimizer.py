"""
Case Study 07: 1D Pipe Cutting Stock & Scrap Minimization Engine
PT Steel Pipe Industry of Indonesia Tbk (SPINDO) - Backend Track
"""
from dataclasses import dataclass
from typing import List, Dict, Any


@dataclass
class CutRequest:
    order_id: str
    length_mm: int
    quantity: int


@dataclass
class IndividualCut:
    order_id: str
    length_mm: int


class StockPipe:
    def __init__(self, pipe_index: int, capacity_mm: int, blade_kerf_mm: int):
        self.pipe_index = pipe_index
        self.capacity_mm = capacity_mm
        self.blade_kerf_mm = blade_kerf_mm
        self.allocated_cuts: List[IndividualCut] = []
        self.used_length_mm = 0

    @property
    def remaining_space_mm(self) -> int:
        return self.capacity_mm - self.used_length_mm

    def can_fit(self, cut_length_mm: int) -> bool:
        # Effective consumption = cut_length + blade_kerf
        needed = cut_length_mm + self.blade_kerf_mm
        return self.remaining_space_mm >= needed

    def add_cut(self, cut: IndividualCut) -> None:
        self.allocated_cuts.append(cut)
        self.used_length_mm += (cut.length_mm + self.blade_kerf_mm)


def optimize_pipe_cutting(
    stock_length_mm: int,
    blade_kerf_mm: int,
    cut_requests: List[CutRequest]
) -> Dict[str, Any]:
    """
    Solves the 1D Pipe Cutting Stock problem using First-Fit Decreasing (FFD) heuristic.
    """
    if stock_length_mm <= 0:
        raise ValueError("Stock pipe length must be a positive integer.")

    # 1. Expand requests into individual cut pieces
    individual_pieces: List[IndividualCut] = []
    for req in cut_requests:
        if req.length_mm > stock_length_mm:
            raise ValueError(
                f"Requested length {req.length_mm}mm exceeds stock pipe length {stock_length_mm}mm"
            )
        for _ in range(req.quantity):
            individual_pieces.append(IndividualCut(order_id=req.order_id, length_mm=req.length_mm))

    # 2. Sort pieces in descending order (Largest first) for First-Fit Decreasing
    individual_pieces.sort(key=lambda p: p.length_mm, reverse=True)

    pipes: List[StockPipe] = []

    # 3. First-Fit Allocation
    for piece in individual_pieces:
        allocated = False
        for pipe in pipes:
            if pipe.can_fit(piece.length_mm):
                pipe.add_cut(piece)
                allocated = True
                break

        if not allocated:
            # Open a new raw stock pipe
            new_pipe = StockPipe(
                pipe_index=len(pipes) + 1,
                capacity_mm=stock_length_mm,
                blade_kerf_mm=blade_kerf_mm
            )
            new_pipe.add_cut(piece)
            pipes.append(new_pipe)

    # 4. Generate summary report
    cutting_plans = []
    total_scrap_length_mm = 0

    for pipe in pipes:
        scrap = pipe.remaining_space_mm
        total_scrap_length_mm += scrap
        cutting_plans.append({
            "pipe_index": pipe.pipe_index,
            "cuts": [{"order_id": c.order_id, "length_mm": c.length_mm} for c in pipe.allocated_cuts],
            "used_length_mm": pipe.used_length_mm,
            "scrap_length_mm": scrap
        })

    total_stock_supplied_mm = len(pipes) * stock_length_mm
    scrap_percentage = (
        round((total_scrap_length_mm / total_stock_supplied_mm) * 100, 2)
        if total_stock_supplied_mm > 0
        else 0.0
    )

    return {
        "stock_pipe_length_mm": stock_length_mm,
        "blade_kerf_mm": blade_kerf_mm,
        "total_raw_pipes_used": len(pipes),
        "total_cuts_produced": len(individual_pieces),
        "total_scrap_length_mm": total_scrap_length_mm,
        "scrap_percentage": scrap_percentage,
        "cutting_plans": cutting_plans
    }
