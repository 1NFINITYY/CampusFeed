import { useState } from "react";
import axios from "axios";

export default function AIInput({ onCreated }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);

  const handleGenerate = async () => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!user) return alert('Please login to use AI metadata feature');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/ai/metadata', { text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMetadata(data.metadata);
    } catch (err) {
      console.error(err);
      alert('Failed to generate metadata');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (!user) return alert('Please login to create job');
    if (!metadata) return alert('No metadata to create job from');
    setLoading(true);
    try {
      await axios.post('/api/jobs', {
        title: metadata.title || 'Untitled',
        description: metadata.short_description || text,
        company: metadata.company || 'Company',
        tags: metadata.tags || [],
        salary_range: metadata.salary_range || '',
        location: metadata.location || 'Remote',
        skills: metadata.skills || []
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      alert('Job created from AI metadata');
      setMetadata(null);
      setText('');
      if (onCreated) onCreated();
    } catch (err) {
      console.error(err);
      alert('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8, marginBottom: 16 }}>
      <h3>Paste job description / text</h3>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} style={{ width: '100%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={handleGenerate} disabled={loading || !text}>
          {loading ? 'Generating...' : 'Generate Metadata'}
        </button>
        {metadata && (
          <button onClick={handleCreateJob} style={{ marginLeft: 8 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Job from Metadata'}
          </button>
        )}
      </div>

      {metadata && (
        <div style={{ marginTop: 12, background: '#fafafa', padding: 8, borderRadius: 6 }}>
          <strong>Metadata preview:</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
