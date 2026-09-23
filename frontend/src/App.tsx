import { useEffect, useState } from 'react';
import {
  fetchRequest,
  LocalIdentity,
  ServiceRequest,
  updateRequestStatus,
} from './api/requests';
import {
  assistRequestIntake,
  IntakeCandidate,
} from './api/request-intake';

const IDENTITIES: LocalIdentity[] = [
  {
    userId: 'employee-001',
    role: 'EMPLOYEE',
    label: 'Employee (requester)',
  },
  {
    userId: 'it-staff-001',
    role: 'IT_STAFF',
    label: 'IT Staff',
  },
];

function friendlyStatus(value: string) {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

export default function App() {
  const [identity, setIdentity] = useState(IDENTITIES[0]);
  const [request, setRequest] =
    useState<ServiceRequest | null>(null);

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [intakeText, setIntakeText] = useState('');
  const [candidate, setCandidate] =
    useState<IntakeCandidate | null>(null);
  const [intakeMessage, setIntakeMessage] = useState('');
  const [intakeLoading, setIntakeLoading] = useState(false);

  async function load() {
    setLoading(true);
    setMessage('');

    try {
      setRequest(
        await fetchRequest('REQ-1001', identity),
      );
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
      const updated = await updateRequestStatus(
        'REQ-1001',
        'IN_PROGRESS',
        identity,
      );

      setRequest(updated);

      setMessage(
        'Request successfully moved to In progress and persisted.',
      );
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function getAiAssistance() {
    setIntakeLoading(true);
    setIntakeMessage('');
    setCandidate(null);

    try {
      const result = await assistRequestIntake(intakeText);
      setCandidate(result);
    } catch (error) {
      setIntakeMessage((error as Error).message);
    } finally {
      setIntakeLoading(false);
    }
  }

  return (
    <main className="page">
      <h1>Internal Operations Service Hub</h1>

      <p className="tagline">
        v0.4 - AI-assisted request intake
      </p>

      <section className="card">
        <h2>AI-Assisted Request Intake</h2>

        <p>
          Describe the support you need in your own words.
          The assistant will propose structured request
          information for your review.
        </p>

        <label>
          What do you need help with?
          <textarea
            value={intakeText}
            onChange={(event) =>
              setIntakeText(event.target.value)
            }
            placeholder="Example: My laptop cannot connect to the office Wi-Fi."
            rows={5}
          />
        </label>

        <button
          onClick={getAiAssistance}
          disabled={intakeLoading}
        >
          {intakeLoading
            ? 'Analyzing...'
            : 'Get AI assistance'}
        </button>

        {intakeMessage && (
          <p className="message">{intakeMessage}</p>
        )}

        {candidate && (
          <div className="candidate">
            <h3>Suggested request</h3>

            <p>
              <strong>Department:</strong>{' '}
              {candidate.department}
            </p>

            <p>
              <strong>Category:</strong>{' '}
              {candidate.category}
            </p>

            <p>
              <strong>Description:</strong>{' '}
              {candidate.description}
            </p>

            <p>
              <strong>Needs clarification:</strong>{' '}
              {candidate.needsClarification
                ? 'Yes'
                : 'No'}
            </p>

            {candidate.clarificationQuestion && (
              <p>
                <strong>Clarification question:</strong>{' '}
                {candidate.clarificationQuestion}
              </p>
            )}

            <p className="advisory">
              AI suggestions are advisory. Review the
              information before using it.
            </p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Existing Service Request</h2>

        <label>
          Local development identity
          <select
            value={identity.userId}
            onChange={(event) =>
              setIdentity(
                IDENTITIES.find(
                  (item) =>
                    item.userId === event.target.value,
                )!,
              )
            }
          >
            {IDENTITIES.map((item) => (
              <option
                key={item.userId}
                value={item.userId}
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button onClick={load} disabled={loading}>
          Reload request
        </button>

        {request && (
          <div>
            <h3>{request.id}</h3>

            <p>
              <strong>Department:</strong>{' '}
              {request.department}
            </p>

            <p>
              <strong>Category:</strong>{' '}
              {request.category}
            </p>

            <p>
              <strong>Description:</strong>{' '}
              {request.description}
            </p>

            <p>
              <strong>Status:</strong>{' '}
              {friendlyStatus(request.status)}
            </p>

            <button
              onClick={startWork}
              disabled={loading}
            >
              Start work
            </button>
          </div>
        )}

        {message && (
          <p className="message">{message}</p>
        )}
      </section>
    </main>
  );
}