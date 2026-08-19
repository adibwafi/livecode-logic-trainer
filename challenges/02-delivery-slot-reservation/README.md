# Case Study 02: Delivery Slot Reservation Engine

## 🚚 Background & Context
In grocery on-demand delivery at HappyFresh, orders are fulfilled by personal shoppers and delivered in discrete time windows (e.g. `10:00 - 12:00`, `14:00 - 16:00`). Each delivery slot is tied to a specific hub and has a strict van capacity limit (e.g., maximum 3 orders per slot).

During high-traffic periods, hundreds of users may attempt to reserve the same popular delivery window simultaneously. To prevent driver overload and missed SLAs, our booking engine must process concurrent incoming booking requests in strict chronological order, enforce capacity limits, detect duplicate reservations, and gracefully reject overbooked requests.

In this challenge, you will implement `reserveDeliverySlots` in `slotBooking.ts`.

---

## 🎯 Requirements

1. **Chronological Processing**:
   - Requests must be processed strictly in ascending order of their `timestamp`.
   - If two requests have the exact same timestamp, maintain stable ordering based on their index in the incoming array.

2. **Capacity Enforcement**:
   - Each slot has a maximum `capacity`.
   - When confirmed bookings for a slot reach `capacity`, all subsequent requests for that slot must be rejected with failure reason: `'SLOT_FULL'`.

3. **Invalid & Duplicate Handling**:
   - If a request specifies a `slotId` that does not exist in the available slots array, reject with reason: `'SLOT_NOT_FOUND'`.
   - If the same `userId` attempts to reserve the same `slotId` more than once, reject subsequent attempts with reason: `'DUPLICATE_USER_IN_SLOT'` (do not decrement capacity twice for the same user).

4. **Slot Utilization Ledger**:
   - Provide an accurate summary object `slotUtilization` mapping each `slotId` to its:
     - `capacity`: Total slot capacity.
     - `bookedCount`: Total successfully booked orders.
     - `remainingCapacity`: Remaining open spots (`capacity - bookedCount`).

---

## 📥 Input / Output Schema

### Input
- `availableSlots`: `DeliverySlot[]`
- `bookingRequests`: `BookingRequest[]`

### Output: `SlotBookingResult`
```typescript
interface SlotBookingResult {
  confirmedBookings: ConfirmedBooking[];
  failedBookings: FailedBooking[];
  slotUtilization: Record<string, SlotUtilization>;
}
```

---

## 💡 Example

```typescript
const slots: DeliverySlot[] = [
  { id: "SLOT-01", startTime: "10:00", endTime: "12:00", capacity: 2 },
];

const requests: BookingRequest[] = [
  { requestId: "req-3", userId: "user-C", slotId: "SLOT-01", timestamp: 1700000030 },
  { requestId: "req-1", userId: "user-A", slotId: "SLOT-01", timestamp: 1700000010 },
  { requestId: "req-2", userId: "user-B", slotId: "SLOT-01", timestamp: 1700000020 },
];

// Chronological order processed: req-1 (T10), req-2 (T20), req-3 (T30)
// Confirmed: req-1 (User A), req-2 (User B) -> Capacity reached (2/2)
// Failed: req-3 (User C) -> Reason: 'SLOT_FULL'
```

---

## 🧪 Running the Tests
```bash
npm test challenges/02-delivery-slot-reservation/index.test.ts
```
