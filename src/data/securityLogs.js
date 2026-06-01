const securityLogs = [
  {
    id: 1,
    timestamp: '2026-06-01 08:30:00',
    action: 'Login successful',
    device: 'Chrome on Windows, Dhaka, BD',
    status: 'allowed',
  },
  {
    id: 2,
    timestamp: '2026-05-31 22:15:00',
    action: 'Failed login attempt',
    device: 'Unknown device, IP: 192.168.x.x',
    status: 'blocked',
  },
  {
    id: 3,
    timestamp: '2026-05-31 14:00:00',
    action: 'Password change request',
    device: 'Firefox on Android, Dhaka, BD',
    status: 'allowed',
  },
  {
    id: 4,
    timestamp: '2026-05-30 09:45:00',
    action: 'New device login',
    device: 'Safari on macOS, New York, US',
    status: 'verified',
  },
  {
    id: 5,
    timestamp: '2026-05-29 18:20:00',
    action: 'Firebase security rules updated',
    device: 'Admin console',
    status: 'allowed',
  },
]

export default securityLogs
