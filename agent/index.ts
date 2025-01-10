// 1. Import required dependencies
import express, { type Request, type Response } from 'express';
import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { GroqChatLLM } from "bee-agent-framework/adapters/groq/chat";
import { DynamicTool, StringToolOutput } from "bee-agent-framework/tools/base";
import { FrameworkError } from "bee-agent-framework/errors";
import { UnconstrainedMemory } from "bee-agent-framework/memory/unconstrainedMemory";
import { z } from "zod";
import cors from 'cors';
import pool from './db';

// 2. Initialize Express app with middleware
const app = express();
app.use(express.json());
app.use(cors());

// 3. Configure LLM with Groq model
const llm = new GroqChatLLM({
    modelId: "llama-3.3-70b-specdec",
    parameters: {
        temperature: 0, // Set to 0 for consistent, deterministic responses
    },
});

// 4. Define brewing guide tool schema and configuration
const getBrewingGuideTool = new DynamicTool({
    name: "GetBrewingGuide",
    description: "Provides customized brewing instructions based on method and preferences",
    inputSchema: z.object({
        method: z.enum(["pourover", "french-press", "espresso", "cold-brew", "aeropress", "moka-pot"]),
        strength: z.enum(["light", "medium", "strong"]),
        servings: z.number().min(1).max(8)
    }),

    // 5. Implement brewing guide tool handler
    async handler(input) {
        try {
            // 5.1. Get brewing method details
            const methodResult = await pool.query(
                'SELECT * FROM brewing_methods WHERE name = $1',
                [input.method]
            );
            const method = methodResult.rows[0];

            // 5.2. Get ratio for strength
            const ratioResult = await pool.query(
                'SELECT ratio FROM brewing_ratios WHERE strength = $1',
                [input.strength]
            );
            const ratio = ratioResult.rows[0].ratio;

            // 5.3. Calculate measurements
            const coffeeGrams = input.servings * 15; // Base 15g per serving
            const waterMl = coffeeGrams * ratio;

            return new StringToolOutput(
                `Recipe for ${input.servings} serving(s) of ${input.strength} ${input.method}:\n` +
                `Coffee: ${coffeeGrams}g\n` +
                `Water: ${waterMl}ml\n` +
                `Grind Size: ${method.grind_size}\n` +
                `Water Temperature: ${method.water_temp}\n` +
                `Total Brew Time: ${method.brew_time}\n`
            );
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to retrieve brewing guide information');
        }
    },
});

// 6. Define shipping estimates tool schema
const getShippingEstimateTool = new DynamicTool({
    name: "GetShippingEstimate",
    description: "Provides shipping estimates and delivery information for different regions",
    inputSchema: z.object({
        region: z.enum([
            "USA-West", "USA-Central", "USA-East",
            "Canada", "Europe", "Asia", "Australia",
            "South-America", "Other"
        ]),
        method: z.enum(["standard", "express", "international"]).optional()
    }),

    // 7. Implement shipping estimates tool handler
    async handler(input) {
        try {
            // 7.1. Query shipping data
            const result = await pool.query(
                'SELECT * FROM shipping_regions WHERE name = $1',
                [input.region]
            );

            // 7.2. Process shipping details
            const regionData = result.rows[0];
            const method = input.method || "standard";
            const deliveryTime = method === "express" ? regionData.express_delivery : regionData.standard_delivery;

            return new StringToolOutput(
                `Shipping to ${input.region}:\n` +
                `Delivery Time (${method}): ${deliveryTime}\n` +
                `Shipping Cost: ${regionData.cost}\n` +
                `Additional Information: ${regionData.notes}\n\n` +
                `All orders include:\n` +
                `- Free tracking\n` +
                `- Freshly roasted guarantee\n` +
                `- Sustainable packaging\n` +
                `- 30-day satisfaction guarantee`
            );
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to retrieve shipping information');
        }
    }
});

// 8. Define coffee club membership tool
const handleCoffeeClubTool = new DynamicTool({
    name: "HandleCoffeeClub",
    description: "Handle coffee club membership queries and signups as a component in the UI. This only shows explicity the coffee club modal, and has nothing to do with contacting the company.",
    inputSchema: z.object({
        action: z.string()
    }),

    // 9. Implement coffee club tool handler
    async handler(input) {
        try {
            // 9.1. Get coffee club benefits
            const result = await pool.query('SELECT benefit FROM coffee_club_benefits');
            const benefits = result.rows.map(row => `- ${row.benefit}`).join('\n');
            return new StringToolOutput(
                "I'll help you join our Coffee Club! " +
                "Our Coffee Club members enjoy:\n" +
                benefits + "\n\n" +
                "SHOW_COFFEE_CLUB_MODAL"  // Special flag to show modal
            );
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to retrieve coffee club information');
        }
    }
});

// 10. Define information request tool schema
const requestMoreInfoTool = new DynamicTool({
    name: "RequestMoreInfo",
    description: "Handles customer support inquiries with smart routing based on urgency that aren't otherwise handled by other tools. If a user is asking for contact information, use this tool to handle it.",
    inputSchema: z.object({
        topic: z.string(),
        urgency: z.enum(["low", "medium", "high"]).optional(),
        category: z.enum([
            "product",
            "shipping",
            "technical",
            "wholesale",
            "other"
        ]),
        customerName: z.string().optional(),
        orderNumber: z.string().optional()
    }),

    async handler(input) {
        try {
            const result = await pool.query(
                'SELECT * FROM support_categories WHERE name = $1',
                [input.category]
            );

            const categoryData = result.rows[0];
            const urgencyLevel = input.urgency || "medium";

            // Core routing logic based on urgency
            let response = "";
            if (urgencyLevel === "high") {
                response = `For urgent ${input.category} support, please call us at 1-888-12345-6789. We'll assist you immediately.`;
            } else if (urgencyLevel === "low") {
                response = `For ${input.category} support, please visit our self-service portal at coffeecompany.com/support/${input.category}`;
            } else {
                response = `For ${input.category} support, please email us at support@coffeecompany.com. We'll respond within ${categoryData.timeline}.`;
            }

            return new StringToolOutput(response);
        } catch (error) {
            console.error('Database error:', error);
            return new StringToolOutput('Sorry, we are experiencing technical difficulties. Please call us at 1-888-URGENT-CO for immediate assistance.');
        }
    }
});

// 12. Define store locations tool schema
const getStoreLocationsTool = new DynamicTool({
    name: "GetStoreLocations",
    description: "Provides information about store locations in different neighborhoods",
    inputSchema: z.object({
        city: z.enum(["San Francisco", "Portland", "Seattle", "Chicago", "New York"])
    }),

    // 13. Implement store locations tool handler
    async handler(input) {
        try {
            // 13.1. Query store locations
            const result = await pool.query(
                'SELECT * FROM store_locations WHERE city = $1',
                [input.city]
            );

            // 13.2. Handle no locations case
            if (result.rows.length === 0) {
                return new StringToolOutput(
                    `We currently don't have any store locations in ${input.city}. ` +
                    `Please check back later as we're expanding! ` +
                    `You can visit our online store 24/7 at www.coffeecompany.com`
                );
            }

            // 13.3. Format location information
            return new StringToolOutput(
                result.rows.map(loc =>
                    `${loc.neighborhood} Location:\n` +
                    `Address: ${loc.address}\n` +
                    `Hours: ${loc.hours}\n` +
                    `Specialties: ${loc.specialties}\n` +
                    `Parking: ${loc.parking}\n`
                ).join("\n\n")
            );
        } catch (error) {
            console.error('Database error:', error);
            throw new Error('Failed to retrieve store location information');
        }
    },
});

// 14. Initialize BeeAgent with configured tools
const agent = new BeeAgent({
    llm,
    memory: new UnconstrainedMemory(),
    tools: [
        getBrewingGuideTool,
        getShippingEstimateTool,
        getStoreLocationsTool,
        handleCoffeeClubTool,
        requestMoreInfoTool
    ],
});

// 15. Define question handling logic
async function handleAskEndpoint(req: Request, res: Response) {
    try {
        // 15.1. Extract and validate question
        const { question } = req.body as { question?: string };

        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // 15.2. Initialize conversation tracking
        const steps: Array<{ type: string; content: string }> = [];

        // 15.3. Process question through agent
        const response = await agent
            .run(
                {
                    prompt: `You are a coffee expert and customer service representative. The customer asks: ${question}. You do not have the ability for orders, but you can answer general questions about the company and coffee.`
                },
                {
                    execution: {
                        maxRetriesPerStep: 5,
                        totalMaxRetries: 10,
                        maxIterations: 15,
                    },
                },
            )
            .observe((emitter) => {
                // 15.4. Handle different types of events
                emitter.on("error", ({ error }) => {
                    console.log(`Error: `, FrameworkError.ensure(error).dump());
                    steps.push({
                        type: "error",
                        content: FrameworkError.ensure(error).dump()
                    });
                });
                emitter.on("retry", () => {
                    steps.push({
                        type: "retry",
                        content: "Retrying"
                    });
                });
                emitter.on("update", ({ update }) => {
                    steps.push({
                        type: update.key,
                        content: update.value
                    });
                });
            });

        // 15.5. Return response
        return res.status(200).json({
            answer: response.result?.text ?? "No answer available.",
            steps: steps
        });
    } catch (error) {
        // 15.6. Handle errors
        if (error instanceof Error) {
            console.error(FrameworkError.ensure(error).dump());
            return res.status(500).json({ error: 'Internal server error' });
        } else {
            console.error('Unknown error:', error);
            return res.status(500).json({ error: 'Unknown error occurred' });
        }
    }
}

// 16. Configure API endpoints
app.post('/ask', async (req: Request, res: Response) => {
    await handleAskEndpoint(req, res);
});

// 17. Initialize server
app.listen(3008, () => {
    console.log('Server is running on port 3008');
});

// 18. Example test questions for reference
// 18.1. "How long will shipping take to Europe?"
// 18.2. "What's the best way to brew pour-over coffee for 4 people?"
// 18.3. "Tell me about your Ethiopian coffees"
// 18.4. "Where is the NYC location?"
