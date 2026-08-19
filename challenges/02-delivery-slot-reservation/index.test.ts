import { reserveDeliverySlots, DeliverySlot, BookingRequest } from './index';

describe('HappyFresh Delivery Slot Reservation Engine', () => {
  const sampleSlots: DeliverySlot[] = [
    { id: 'SLOT-08-10', startTime: '08:00', endTime: '10:00', capacity: 2 },
    { id: 'SLOT-10-12', startTime: '10:00', endTime: '12:00', capacity: 3 },
    { id: 'SLOT-14-16', startTime: '14:00', endTime: '16:00', capacity: 1 },
  ];

  it('1. should process incoming booking requests in chronological order regardless of input array order', () => {
    const requests: BookingRequest[] = [
      { requestId: 'req-3', userId: 'user-C', slotId: 'SLOT-08-10', timestamp: 1700000030 },
      { requestId: 'req-1', userId: 'user-A', slotId: 'SLOT-08-10', timestamp: 1700000010 },
      { requestId: 'req-2', userId: 'user-B', slotId: 'SLOT-08-10', timestamp: 1700000020 },
    ];

    const result = reserveDeliverySlots(sampleSlots, requests);

    // Slot capacity is 2. req-1 (T10) and req-2 (T20) must be confirmed.
    // req-3 (T30) must fail with SLOT_FULL because capacity of 2 was reached.
    expect(result.confirmedBookings).toHaveLength(2);
    expect(result.confirmedBookings[0].requestId).toBe('req-1');
    expect(result.confirmedBookings[1].requestId).toBe('req-2');

    expect(result.failedBookings).toHaveLength(1);
    expect(result.failedBookings[0]).toEqual({
      requestId: 'req-3',
      userId: 'user-C',
      slotId: 'SLOT-08-10',
      reason: 'SLOT_FULL',
      timestamp: 1700000030,
    });
  });

  it('2. should reject bookings with SLOT_NOT_FOUND when requesting a non-existent slot ID', () => {
    const requests: BookingRequest[] = [
      { requestId: 'req-invalid', userId: 'user-X', slotId: 'SLOT-99-99', timestamp: 1700000010 },
      { requestId: 'req-valid', userId: 'user-Y', slotId: 'SLOT-14-16', timestamp: 1700000020 },
    ];

    const result = reserveDeliverySlots(sampleSlots, requests);

    expect(result.confirmedBookings).toHaveLength(1);
    expect(result.confirmedBookings[0].requestId).toBe('req-valid');

    expect(result.failedBookings).toHaveLength(1);
    expect(result.failedBookings[0].reason).toBe('SLOT_NOT_FOUND');
    expect(result.failedBookings[0].requestId).toBe('req-invalid');
  });

  it('3. should reject duplicate reservation attempts by the same user in the same slot with DUPLICATE_USER_IN_SLOT', () => {
    const requests: BookingRequest[] = [
      { requestId: 'req-dup-1', userId: 'user-Loyal', slotId: 'SLOT-10-12', timestamp: 1700000010 },
      { requestId: 'req-dup-2', userId: 'user-Loyal', slotId: 'SLOT-10-12', timestamp: 1700000015 },
      { requestId: 'req-other', userId: 'user-Different', slotId: 'SLOT-10-12', timestamp: 1700000020 },
    ];

    const result = reserveDeliverySlots(sampleSlots, requests);

    expect(result.confirmedBookings).toHaveLength(2);
    expect(result.confirmedBookings.map((b) => b.requestId)).toEqual(['req-dup-1', 'req-other']);

    expect(result.failedBookings).toHaveLength(1);
    expect(result.failedBookings[0].reason).toBe('DUPLICATE_USER_IN_SLOT');
    expect(result.failedBookings[0].requestId).toBe('req-dup-2');
  });

  it('4. should calculate accurate slot utilization metrics across all configured slots', () => {
    const requests: BookingRequest[] = [
      { requestId: 'req-1', userId: 'user-1', slotId: 'SLOT-10-12', timestamp: 1700000010 },
      { requestId: 'req-2', userId: 'user-2', slotId: 'SLOT-10-12', timestamp: 1700000020 },
      { requestId: 'req-3', userId: 'user-3', slotId: 'SLOT-14-16', timestamp: 1700000030 },
    ];

    const result = reserveDeliverySlots(sampleSlots, requests);

    expect(result.slotUtilization['SLOT-08-10']).toEqual({
      capacity: 2,
      bookedCount: 0,
      remainingCapacity: 2,
    });
    expect(result.slotUtilization['SLOT-10-12']).toEqual({
      capacity: 3,
      bookedCount: 2,
      remainingCapacity: 1,
    });
    expect(result.slotUtilization['SLOT-14-16']).toEqual({
      capacity: 1,
      bookedCount: 1,
      remainingCapacity: 0,
    });
  });

  it('5. should handle empty request queue and preserve initialized utilization records', () => {
    const result = reserveDeliverySlots(sampleSlots, []);

    expect(result.confirmedBookings).toEqual([]);
    expect(result.failedBookings).toEqual([]);
    expect(Object.keys(result.slotUtilization)).toHaveLength(3);
    expect(result.slotUtilization['SLOT-08-10'].remainingCapacity).toBe(2);
  });
});
