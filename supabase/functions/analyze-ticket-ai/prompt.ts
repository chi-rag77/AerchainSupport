export const getAnalysisPrompt = (customerName: string, messages: any[]) => {
  const conversation = messages.map(m => `${m.is_agent ? 'Agent' : 'Customer'}: ${m.body_html}`).join('\n---\n');

  return `You are an enterprise support intelligence AI.
Analyze the following ticket conversation for customer "${customerName}".

Return STRICT JSON with the following structure:
{
  "summary": "A concise 2-3 sentence summary of the issue and current state.",
  "customer_tone": "calm | frustrated | angry | confused | urgent",
  "agent_tone": "professional | empathetic | robotic | dismissive",
  "escalation_risk": "low | medium | high",
  "is_escalating": true/false,
  "escalation_reason": "Brief explanation of why it is or isn't escalating.",
  "sentiment_score": -1.0 to 1.0,
  "sentiment_trend": "improving | worsening | stable",
  "suggested_action": "Bullet points of recommended next steps.",
  "confidence_score": 0-100
}

Conversation:
${conversation}

JSON Output:`;
};