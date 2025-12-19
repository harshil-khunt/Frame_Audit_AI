import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from '../types/index.js';
import { PromptBuilder } from './promptBuilder.js';

/**
 * LLMService handles communication with the LLM provider
 * Requirements: 10.3, 10.5
 */
export class LLMService {
  private client: GoogleGenerativeAI;
  private promptBuilder: PromptBuilder;
  private model: string;
  private temperature: number;
  private maxTokens: number;
  private timeout: number;

  constructor(
    apiKey: string,
    model: string = 'gemini-1.5-pro',
    temperature: number = 0.3,
    maxTokens: number = 3000,
    timeout: number = 30000
  ) {
    this.client = new GoogleGenerativeAI(apiKey);
    this.promptBuilder = new PromptBuilder();
    this.model = model;
    this.temperature = temperature;
    this.maxTokens = maxTokens;
    this.timeout = timeout;
  }

  /**
   * Analyzes a scenario using the LLM
   * Implements retry logic for transient failures
   * Requirements: 10.3, 10.5
   */
  async analyze(scenario: string): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      const result = await this.callLLM(scenario);
      const processingTime = Date.now() - startTime;

      // Add metadata
      return {
        ...result,
        metadata: {
          analyzedAt: new Date(),
          processingTime,
        },
      };
    } catch (error) {
      // Retry once on transient failures
      console.error('LLM call failed, retrying once:', error);
      
      try {
        const result = await this.callLLM(scenario);
        const processingTime = Date.now() - startTime;

        return {
          ...result,
          metadata: {
            analyzedAt: new Date(),
            processingTime,
          },
        };
      } catch (retryError) {
        throw new Error(`LLM analysis failed after retry: ${retryError}`);
      }
    }
  }

  /**
   * Makes the actual LLM API call
   */
  private async callLLM(scenario: string): Promise<Omit<AnalysisResult, 'metadata'>> {
    // Demo mode fallback for quota issues
    if (process.env.DEMO_MODE === 'true') {
      return this.getDemoResponse(scenario);
    }

    const systemPrompt = this.promptBuilder.buildSystemPrompt();
    const userPrompt = this.promptBuilder.buildUserPrompt(scenario);

    // Combine system and user prompts for Gemini
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
      },
    });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    let content = response.text();

    if (!content) {
      throw new Error('LLM returned empty response');
    }

    // Strip markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (error) {
      throw new Error(`Failed to parse LLM response as JSON: ${error}`);
    }
  }

  /**
   * Returns a demo response for testing when API quota is exceeded
   */
  private getDemoResponse(scenario: string): Omit<AnalysisResult, 'metadata'> {
    return {
      frameAudit: {
        assumptions: [
          "The problem as stated is the actual problem",
          "Current constraints are fixed and unchangeable",
          "All stakeholders have been identified"
        ],
        falseBinaries: ["Either solve it this way or fail"],
        artificialConstraints: ["Time pressure may be self-imposed"],
        beneficiaries: "Those who benefit from maintaining the current framing",
        hiddenElements: ["Systemic factors", "Power dynamics", "Alternative approaches"],
        framingVerdict: "PARTIALLY_FLAWED",
        confidenceScore: 0.7,
        whyThisFramingPersists: "Institutional inertia and cognitive shortcuts make this framing convenient"
      },
      systemMap: {
        actors: [
          { name: "Decision Maker", type: "person", role: "Makes choices" },
          { name: "System", type: "system", role: "Executes decisions" }
        ],
        controlPoints: ["Decision point", "Resource allocation"],
        dependencies: [
          { from: "Decision Maker", to: "System", description: "Controls system behavior" }
        ],
        failureModes: ["Misaligned incentives", "Information asymmetry"],
        powerAsymmetries: [
          { decisionMaker: "Decision Maker", costBearer: "End Users", description: "Those who decide don't bear the costs" }
        ],
        primaryControlHolder: "Decision Maker",
        primaryCostBearer: "End Users",
        misalignmentDescription: "Control and cost are separated, creating misaligned incentives"
      },
      realityCompression: {
        coreTruths: [
          "The framing of the problem shapes what solutions appear possible",
          "Power asymmetries mean those who decide often don't bear the consequences",
          "Systemic issues require systemic solutions, not individual fixes"
        ]
      }
    };
  }

  /**
   * Returns the configured temperature
   */
  getTemperature(): number {
    return this.temperature;
  }

  /**
   * Returns the configured model
   */
  getModel(): string {
    return this.model;
  }
}
