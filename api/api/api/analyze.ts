// This is a Vercel Serverless Function.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { FormData } from '../types';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("Server Configuration Error: The Gemini API key is missing. Please set the API_KEY environment variable in your Vercel project settings.");
    }
    return new GoogleGenAI({ apiKey });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const formData = req.body as FormData;
        const { injectionFrequency, bloodTestTiming, labs, symptoms } = formData;

        if (!labs || !labs.freeTestosterone || !labs.estradiol || !labs.hematocrit) {
            return res.status(400).json({ message: 'Incomplete lab data provided.' });
        }

        const ai = getAiClient();

        const prompt = `
          You are an expert AI assistant specializing in testosterone replacement therapy (TRT) optimization, trained on years of clinical insights and practice. Your analysis is not a one-size-fits-all solution; nothing in medicine is. It is crafted to help the user have a more informed discussion with their doctor to optimize their therapy.

          **Analysis Philosophy to embody:**
          - There is no single "perfect" testosterone level for all men. The optimal level is found by balancing three key areas: lab results, the resolution of initial symptoms, and the emergence of any new symptoms.
          - It takes approximately 8 weeks for the body to reach a steady state after a dose change. The impact at a cellular level takes time, so patience is key.
          - Your primary goal is to identify patterns and provide potential discussion points, not to give direct medical advice.

          **Disclaimer to include at the start of your response:** "Important: This analysis is based on years of clinical insights and practice, but it is not medical advice and is not a substitute for a personalized consultation with your own doctor. It is crafted to help you optimize your therapy in conjunction with your healthcare provider. Always consult with them before making any changes to your treatment plan."

          **User's Data:**
          - **Injection Frequency:** ${injectionFrequency || 'Not provided'}
          - **Blood Test Timing:** ${bloodTestTiming || 'Not provided'}
          - **Lab Results:**
              - Total Testosterone: ${labs.totalTestosterone || 'Not provided'} ng/dL
              - Free Testosterone: ${labs.freeTestosterone} pg/mL
              - Estradiol (Sensitive): ${labs.estradiol} pg/mL
              - Hematocrit: ${labs.hematocrit} %
          - **Reported Symptoms:** ${symptoms.length > 0 ? symptoms.join(', ') : 'None reported'}

          **Analysis Guidelines:**

          1.  **Initial Assessment & Context:**
              - Acknowledge the user's data. Emphasize the importance of blood test timing (peak vs. trough) in interpreting the results, as this is a critical piece of the puzzle.
              - Peak levels are typically seen 24-72 hours post-injection. Trough levels are right before the next injection.

          2.  **Check for Delayed Adrenergic Overstimulation (The "Honeymoon is Over" Scenario):**
              - This is a CRITICAL pattern to look for. Look for classic symptoms like **Anxiety, Sleep disturbance, and Heart palpitations**.
              - While less common, new or worsening **Fatigue** can sometimes be part of this pattern, but it's crucial to first rule out low trough levels, as that is a much more frequent cause of fatigue.
              - This pattern often occurs 1-6 months after starting or changing a dose. The initial "perfect" dose becomes too high as body tissues become saturated.
              - Frame this as a possibility: "Sometimes, a dose that feels great initially can become too much over time as your body adapts. This can lead to symptoms of overstimulation like anxiety, poor sleep, or heart palpitations, even if your trough lab values seem normal. This is a common pattern that is often overlooked."

          3.  **Detailed Lab Breakdown:**
              - **Free Testosterone (pg/mL):** This is a primary marker.
                  - **Optimal PEAK range:** 120-240 pg/mL. This is a general target; individual sweet spots vary.
                  - **Analysis:**
                      - If PEAK Free T is high (> 240 pg/mL) OR if it's within the optimal range but the user has classic overstimulation symptoms (Anxiety, Sleep disturbance, etc.), this is a strong indicator the dose may be too high for their individual system.
                      - If TROUGH Free T is low, and symptoms are Fatigue or Erectile Dysfunction, this suggests the dose may not be lasting the full injection cycle.
                      - If the primary symptom is **Fatigue** and peak/mid-cycle levels are within the optimal range (120-240 pg/mL), it is **highly probable that trough levels are too low**. This should be investigated as the primary cause of fatigue, not overstimulation.
              - **Estradiol (pg/mL):** Crucial for mood, libido, and health.
                  - **Too Low:** <= 20 pg/mL. Can cause low libido, joint pain, anxiety.
                  - **Optimal Range:** 20 - 45 pg/mL.
                  - **Too High:** > 45 pg/mL. Can cause water retention, moodiness, acne.
                  - **Analysis:** Correlate estradiol levels with reported symptoms. High testosterone can convert to high estradiol, creating a secondary wave of symptoms.
              - **Hematocrit (%):** Red blood cell volume.
                  - **High:** > 52%. A potential health risk (blood viscosity, clots). Does NOT typically cause fatigue.
                  - **Analysis:** If high, always suggest discussion with a doctor about management (hydration, cardio, blood donation).

          4.  **Synthesize and Structure the Output:**
              - **Start with the Disclaimer.**
              - **Use markdown \`###\` headings** for these sections: "### Overall Summary", "### Detailed Lab Analysis", "### Connecting Labs to Symptoms (${symptoms.filter(s => s !== 'None of the above').join(', ')})", and "### Potential Discussion Points for Your Doctor". The headings should be styled to stand out.
              - **Overall Summary:** Give a brief, high-level interpretation of the situation.
              - **Connecting Labs to Symptoms:** Explicitly link their specific labs to their specific symptoms. Prioritize the most likely cause.
                  - Example 1 (Overstimulation): "Your reported symptoms of anxiety and sleep disturbance, especially when your blood was drawn at its peak, can be signs of adrenergic overstimulation. This suggests your peak testosterone levels may be too high for your individual nervous system, even if the number falls within a 'normal' range."
                  - Example 2 (Fatigue): "With a mid-cycle Free T of ${labs.freeTestosterone} pg/mL and your primary symptom being fatigue, the most common cause is that your testosterone levels are dropping too low before your next injection. Your symptoms of fatigue are highly suggestive of these lower trough levels."
              - **Potential Discussion Points for Your Doctor:** Frame everything as a discussion topic.
                  - If overstimulation is suspected: "Discussing a strategic dose reduction. This is often the most effective way to resolve symptoms of overstimulation like anxiety and poor sleep."
                  - If trough levels are low (especially with fatigue): "Discussing how to raise your trough level. This could be achieved by either a modest increase in the total weekly dose OR, often more effectively, by increasing the injection frequency (e.g., from once to twice weekly). More frequent injections provide more stable blood levels and can resolve fatigue."
                  - Always stress the importance of follow-up testing to confirm the effect of any changes, rather than relying on symptoms alone.
          `;
      
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ analysis: response.text });
        
    } catch (error) {
        console.error("Error in /api/analyze:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
        return res.status(500).json({ message: `Failed to analyze results: ${errorMessage}` });
    }
}
