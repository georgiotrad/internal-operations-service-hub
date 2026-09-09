import { useEffect, useState } from 'react';
import {
  fetchRequest,
  LocalIdentity,
  ServiceRequest,
  updateRequestStatus,
} from './api/requests';

const IDENTITIES: LocalIdentity[] = [
  { userId: 'employee-001', role: 'EMPLOYEE', label: 'Employee (requester)' },
  { userId: 'it-staff-001', role: 'IT_STAFF', label: 'IT Staff' },
];

function friendlyStatus(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}

export default function App() {
  const [identity, setIdentity] = useState(IDENTITIES[0]);
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMessage('');
    try {
      setRequest(await fetchRequest('REQ-1001', identity));
    } catch (error) {
      setRequest(null);
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [identity.userId]);

  async function startWork() {
    setLoading(true);
    setMessage('');
    try {
      const updated = await updateRequestStatus('REQ-1001', 'IN_PROGRESS', identity);
      setRequest(updated);
      setMessage('Request successfully moved to In progress and persisted.');
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <h1>Internal Operations Service Hub</h1>
      <p className="tagline">Week 2 — Protected request lifecycle slice</p>

      <label>
        Local development identity
        <select
          value={identity.userId}
          onChange={(event) =>
            setIdentity(IDENTITIES.find((item) => item.userId === event.target.value)!)
          }
        >
          {IDENTITIES.map((item) => (
            <option key={item.userId} value={item.userId}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <button onClick={load} disabled={loading}>Reload request</button>

      {request && (
        <section className="card">
          <h2>{request.id}</h2>
          <p><strong>Department:</strong> {request.department}</p>
          <p><strong>Category:</strong> {request.category}</p>
          <p><strong>Description:</strong> {request.description}</p>
          <p><strong>Status:</strong> {friendlyStatus(request.status)}</p>
          <p><strong>Updated:</strong> {new Date(request.updatedAt).toLocaleString()}</p>

          <button onClick={startWork} disabled={loading}>
            Start work
          </button>
        </section>
      )}

      {message && <p className="message">{message}</p>}
    </main>
  );
}
