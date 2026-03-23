exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const apiKey = process.env.PI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing PI_API_KEY env var' })
      };
    }

    const payload = JSON.parse(event.body || '{}');
    const paymentId = payload.paymentId || payload.identifier || payload.id || payload.payment_id || payload?.paymentDTO?.identifier || payload?.paymentDTO?.paymentId || payload?.paymentDTO?.id;
    const txid = payload.txid || payload?.paymentDTO?.transaction?.txid;

    if (!paymentId || !txid) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'paymentId and txid are required', receivedKeys: Object.keys(payload || {}), received: payload })
      };
    }

    const url = `https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`;
    const body = new URLSearchParams({ txid });

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    const text = await resp.text();

    return {
      statusCode: resp.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: String(err && err.message ? err.message : err) })
    };
  }
};
