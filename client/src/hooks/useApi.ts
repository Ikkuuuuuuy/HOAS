import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMockData, setMockData, INITIAL_MOCK_DATABASE, MockDatabaseSchema, matchMasterlistRecord } from '../data/mockDatabase';

interface UseApiOptions {
  manual?: boolean;
}

// Endpoint to Mock Database Key Mapper
function getFallbackMockForEndpoint(endpoint: string): any {
  const clean = endpoint.split('?')[0];

  if (clean === '/api/stats') return getMockData('stats');
  if (clean === '/api/tenants') return getMockData('tenants');
  if (clean === '/api/users') return getMockData('users');
  if (clean === '/api/residents') return getMockData('residents');
  if (clean === '/api/billing') return getMockData('billing');
  if (clean === '/api/billing/summary') return getMockData('billingSummary');
  if (clean === '/api/facilities') return getMockData('facilities');
  if (clean === '/api/facilities/reservations') return getMockData('reservations');
  if (clean === '/api/visitors') return getMockData('visitors');
  if (clean === '/api/visitors/stats') return getMockData('visitorStats');
  if (clean === '/api/alerts') return getMockData('alerts');
  if (clean === '/api/documents') return getMockData('documents');
  if (clean === '/api/household') return getMockData('household');
  if (clean === '/api/events') return getMockData('events');
  if (clean.startsWith('/api/hoa/financials')) return getMockData('financials');

  return null;
}

export function useApi<T>(endpoint: string, options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(() => getFallbackMockForEndpoint(endpoint) as T | null);
  const [isLoading, setIsLoading] = useState(!options?.manual);
  const [error, setError] = useState<string | null>(null);
  const { accessToken } = useAuth();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const text = await res.text();
      let json: any = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (res.ok && json) {
        setData(json);
        setError(null);
        return;
      }

      // If server returned non-ok or empty, use fallback mock
      const fallback = getFallbackMockForEndpoint(endpoint);
      if (fallback !== null) {
        setData(fallback as T);
        setError(null);
      } else {
        throw new Error(json?.error || `HTTP ${res.status}`);
      }
    } catch (e: any) {
      // Fallback to local mock data on network error (e.g. Vercel deployment)
      const fallback = getFallbackMockForEndpoint(endpoint);
      if (fallback !== null) {
        setData(fallback as T);
        setError(null);
      } else {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, accessToken]);

  useEffect(() => {
    if (!options?.manual) {
      fetchData();
    }
  }, [fetchData, options?.manual]);

  return { data, isLoading, error, refetch: fetchData };
}

export async function apiCall<T>(
  endpoint: string,
  method: string,
  body?: any,
  token?: string
): Promise<T> {
  try {
    const res = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (res.ok && data) {
      return data as T;
    }
  } catch {
    // Network failure / Serverless fallback
  }

  // ── CLIENT-SIDE MOCK SIMULATION ENGINE ───────────────────────
  const clean = endpoint.split('?')[0];

  // 0. Public Homeowner Registration with Masterlist Auto-Verification
  if ((clean === '/api/hoa/register-homeowner' || clean === '/api/auth/register') && method === 'POST') {
    const match = matchMasterlistRecord({
      fullName: body.fullName || '',
      block: body.block || body.address || '',
      lot: body.lot || body.address || '',
      accountNo: body.accountNo || '',
      phone: body.contactNumber || body.phone || '',
    });

    const isAutoApproved = !!match;
    const userStatus = isAutoApproved ? 'active' : 'pending_approval';
    const userId = `usr-res-${Date.now()}`;

    // Add to mock users
    const currentUsers = getMockData('users') || [];
    const newUser = {
      id: userId,
      full_name: body.fullName,
      email: body.email,
      role_name: 'resident',
      tenant_name: 'Bria Northridge Grove HOA',
      tenant_id: 'tenant-palmera-1',
      is_active: 1,
      status: userStatus,
      is_verified: isAutoApproved ? 1 : 0,
      verification_type: isAutoApproved ? 'auto_masterlist_match' : 'pending_manual',
      created_at: new Date().toISOString(),
    };
    setMockData('users', [newUser, ...currentUsers]);

    // Add to mock residents
    const currentResidents = getMockData('residents') || [];
    const newResident = {
      id: `res-${Date.now()}`,
      full_name: body.fullName,
      email: body.email,
      contact_number: body.contactNumber,
      address: body.address || `${body.block || 'Block 3'} ${body.lot || 'Lot 12'}, NRG Phase 2`,
      civil_status: 'married',
      indigency_status: 0,
      voter_status: 'registered',
      created_at: new Date().toISOString(),
    };
    setMockData('residents', [newResident, ...currentResidents]);

    return {
      message: isAutoApproved
        ? '🎉 Instant Auto-Verification Successful! Verified against NRG PH2 HOA Official Masterlist. Your account is immediately activated!'
        : 'Registration successful! Your application is in the queue for manual HOA Board review.',
      userId,
      status: userStatus,
      autoAccepted: isAutoApproved,
      matchedRecord: match || null,
    } as unknown as T;
  }

  // 1. Household Members
  if (clean === '/api/household' && method === 'POST') {
    const current = getMockData('household') || [];
    const newMember = {
      id: `hm-${Date.now()}`,
      tenant_id: 'tenant-palmera-1',
      user_id: 'usr-resident',
      full_name: body.fullName || body.full_name || 'New Member',
      relationship: body.relationship || 'Dependent (Child)',
      gender: body.gender || 'Male',
      birthdate: body.birthdate,
      age: body.age,
      contact_number: body.contactNumber || body.contact_number,
      email: body.email,
      occupation: body.occupation,
      is_emergency_contact: body.isEmergencyContact ? 1 : 0,
      has_rfid_access: body.hasRfidAccess ? 1 : 0,
      notes: body.notes,
      created_at: new Date().toISOString(),
    };
    const updated = [newMember, ...current];
    setMockData('household', updated);
    return newMember as unknown as T;
  }

  if (clean.startsWith('/api/household/') && method === 'PUT') {
    const id = clean.split('/').pop();
    const current = getMockData('household') || [];
    const updated = current.map((m: any) => m.id === id ? { ...m, ...body } : m);
    setMockData('household', updated);
    return { success: true } as unknown as T;
  }

  if (clean.startsWith('/api/household/') && method === 'DELETE') {
    const id = clean.split('/').pop();
    const current = getMockData('household') || [];
    const updated = current.filter((m: any) => m.id !== id);
    setMockData('household', updated);
    return { success: true } as unknown as T;
  }

  // 2. Facilities & Reservations
  if (clean === '/api/facilities/reservations' && method === 'POST') {
    const current = getMockData('reservations') || [];
    const newResv = {
      id: `resv-${Date.now()}`,
      facility_id: body.facilityId || 'fac-basketball-ph2',
      facility_name: 'NRG PH2 Covered Basketball Court',
      reserved_by: 'usr-resident',
      resident_name: 'Ricardo Dalisay (Resident Owner)',
      title: body.title || 'Basketball Practice',
      booking_date: body.bookingDate || new Date().toISOString().split('T')[0],
      start_time: body.startTime,
      end_time: body.endTime,
      time_slot_label: body.timeSlotLabel || '04:00 PM – 06:00 PM',
      status: 'approved',
      booking_for: body.bookingFor || 'household',
      notes: body.notes,
    };
    const updated = [newResv, ...current];
    setMockData('reservations', updated);
    return newResv as unknown as T;
  }

  if (clean.includes('/facilities/reservations/') && method === 'PATCH') {
    const parts = clean.split('/');
    const resId = parts[parts.indexOf('reservations') + 1];
    const current = getMockData('reservations') || [];
    const updated = current.map((r: any) => r.id === resId ? { ...r, status: body.status || 'approved' } : r);
    setMockData('reservations', updated);
    return { success: true } as unknown as T;
  }

  // 3. Emergency Alerts
  if (clean === '/api/alerts' && method === 'POST') {
    const current = getMockData('alerts') || [];
    const newAlert = {
      id: `alt-${Date.now()}`,
      alertType: body.alertType || 'panic',
      message: body.message || 'Emergency Alert Triggered',
      location: body.location || 'Northridge Grove Phase 2',
      triggeredBy: 'Resident Owner',
      tenantName: 'NRG PH2 HOA INC',
      broadcastTo: body.broadcastTo || 'all',
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newAlert, ...current];
    setMockData('alerts', updated);
    return newAlert as unknown as T;
  }

  if (clean.startsWith('/api/alerts/') && clean.endsWith('/resolve') && method === 'PATCH') {
    const parts = clean.split('/');
    const alertId = parts[parts.indexOf('alerts') + 1];
    const current = getMockData('alerts') || [];
    const updated = current.map((a: any) => a.id === alertId ? { ...a, status: 'resolved' } : a);
    setMockData('alerts', updated);
    return { success: true } as unknown as T;
  }

  // 4. Visitors
  if (clean === '/api/visitors' && method === 'POST') {
    const current = getMockData('visitors') || [];
    const newVisitor = {
      id: `vis-${Date.now()}`,
      host_id: body.hostId || 'usr-resident',
      host_name: 'Ricardo Dalisay (Blk 7 Lot 08)',
      visitor_name: body.visitorName || 'Visitor Guest',
      visitor_id_type: body.visitorIdType || 'national_id',
      visitor_id_no: body.visitorIdNo || 'ID-12345',
      vehicle_plate: body.vehiclePlate || 'N/A',
      purpose: body.purpose || 'Personal Visit',
      gate_pass_no: `GP-${Date.now().toString().slice(-4)}`,
      time_in: new Date().toISOString(),
      time_out: null,
      status: 'inside',
    };
    const updated = [newVisitor, ...current];
    setMockData('visitors', updated);
    return newVisitor as unknown as T;
  }

  if (clean.includes('/visitors/') && clean.endsWith('/checkout') && method === 'PATCH') {
    const parts = clean.split('/');
    const visId = parts[parts.indexOf('visitors') + 1];
    const current = getMockData('visitors') || [];
    const updated = current.map((v: any) => v.id === visId ? { ...v, time_out: new Date().toISOString(), status: 'checked_out' } : v);
    setMockData('visitors', updated);
    return { success: true } as unknown as T;
  }

  // 5. Events
  if (clean === '/api/events' && method === 'POST') {
    const current = getMockData('events') || [];
    const newEvent = {
      id: `ev-${Date.now()}`,
      tenant_id: 'tenant-palmera-1',
      title: body.title,
      meeting_date: body.meetingDate || body.meeting_date,
      location: body.location,
      agenda: body.agenda,
      status: 'upcoming',
      category: body.category || 'community',
    };
    const updated = [newEvent, ...current];
    setMockData('events', updated);
    return newEvent as unknown as T;
  }

  // 6. Generic success simulation
  return { success: true, ...body } as unknown as T;
}
