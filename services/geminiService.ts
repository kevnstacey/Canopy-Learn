import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Hit, Lesson, QuizItem, TrainerInsight, RolePlayFeedback, TranscriptionTurn, SopDraft, VideoAnalysis, Program, Certificate, Policy, QuizAttempt, Quiz, Requirement, SceneAudit, LearnerFeedback, ContentOptimization, SproutQuestion, WorkforceMatch, SopPatch, DriftFlag, ShelfAuditResult, StrategicProspectus, DriftIncident, CalibrationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * generateCalibrationAdvice: Resolves contradictions between AI Proctor and Human Reviewer.
 */
export const generateCalibrationAdvice = async (incident: DriftIncident): Promise<CalibrationResult> => {
    const ai = getAiClient();
    const prompt = `You are a Compliance Quality Auditor.
A Drift Incident occurred during a practical skill verification.
AI VERDICT: ${incident.aiVerdict} (Failed for: ${incident.issue})
HUMAN VERDICT: ${incident.humanVerdict} (Approved)

CONTEXT: The human manager likely prioritized soft-skills or overall intent, while the AI strictly enforced safety parameters.
Your goal is to reconcile this.

1. Analyze if the AI was too strict or the human was too lenient.
2. Provide reasoning for a "Gold Standard" decision.
3. Suggest a precise refinement for the Assessment Rubric to prevent this ambiguity.
4. Estimate the "Alignment Impact" (0-100) this fix will have.

OUTPUT: A JSON object with 'suggestedRubricChange', 'alignmentImpact', and 'reasoning'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestedRubricChange: { type: Type.STRING },
                        alignmentImpact: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ["suggestedRubricChange", "alignmentImpact", "reasoning"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (e) {
        throw new Error("Calibration advice failed.");
    }
};

/**
 * generateStrategicProspectus: High-level analysis for board members.
 */
export const generateStrategicProspectus = async (metrics: any): Promise<StrategicProspectus> => {
    const ai = getAiClient();
    const prompt = `You are a McKinsey Strategic Consultant and a Chief Compliance Officer.
Analyze the following organizational readiness data and provide a board-level prospectus.

DATA:
- Current Readiness Rate: ${metrics.readinessRate}%
- Mitigated Liability: $${metrics.mitigatedRisk}
- Personnel Count: ${metrics.learnerCount}
- Talent Gap Trend: ${JSON.stringify(metrics.talentGap)}

Provide:
1. A punchy, executive narrative about the current "State of Readiness."
2. Estimated financial impact beyond simple liability (efficiency, scaling).
3. Risk analysis (identify critical gaps and evaluate compliance drift).
4. A 3-step future roadmap.

OUTPUT: A JSON object with 'executiveSummary', 'financialImpact' (mitigatedLiability, operationalEfficiencyGain, roiMultiple), 'riskAnalysis' (criticalGaps, complianceDriftRating, regulatoryPosture), and 'futureRoadmap'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        executiveSummary: { type: Type.STRING },
                        financialImpact: {
                            type: Type.OBJECT,
                            properties: {
                                mitigatedLiability: { type: Type.NUMBER },
                                operationalEfficiencyGain: { type: Type.NUMBER },
                                roiMultiple: { type: Type.NUMBER }
                            },
                            required: ["mitigatedLiability", "operationalEfficiencyGain", "roiMultiple"]
                        },
                        riskAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                criticalGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
                                complianceDriftRating: { type: Type.STRING },
                                regulatoryPosture: { type: Type.STRING }
                            },
                            required: ["criticalGaps", "complianceDriftRating", "regulatoryPosture"]
                        },
                        futureRoadmap: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["executiveSummary", "financialImpact", "riskAnalysis", "futureRoadmap"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (e) {
        console.error("Prospectus error:", e);
        throw new Error("Failed to generate board prospectus.");
    }
};

/**
 * analyzeShelfImage: Analyzes a single photo of a site/shelf for compliance.
 */
export const analyzeShelfImage = async (
    base64Data: string,
    fileName: string
): Promise<ShelfAuditResult> => {
    const ai = getAiClient();
    const prompt = `You are an Operational Quality Auditor. 
Analyze this photo of a site area (e.g. retail shelf, warehouse floor, safety station).
Identify:
1. Stock/Layout accuracy.
2. Safety violations or hazards.
3. Labeling or price-tag consistency.
4. Hygiene or organization levels.

Score the area out of 100. Provide a list of findings with fixes.

OUTPUT: A JSON object with 'score', 'summary', and 'findings' array. 
Each finding has 'category', 'issue', 'severity' (Critical/Minor/Info), 'fix'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        findings: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    category: { type: Type.STRING, enum: ['Stock', 'Safety', 'Labeling', 'Hygiene'] },
                                    issue: { type: Type.STRING },
                                    severity: { type: Type.STRING, enum: ['Critical', 'Minor', 'Info'] },
                                    fix: { type: Type.STRING }
                                },
                                required: ["category", "issue", "severity", "fix"]
                            }
                        }
                    },
                    required: ["score", "summary", "findings"]
                }
            }
        });
        const result = JSON.parse(response.text!.trim());
        return { ...result, fileId: Math.random().toString(36).substr(2, 9), fileName: fileName };
    } catch (e) {
        console.error("Shelf analysis failed:", e);
        throw new Error("Vision analysis error.");
    }
};

/**
 * detectDrift: Compares AI's visual analysis/proctoring against a Human's review decision.
 */
export const detectDrift = async (
    aiAnalysis: VideoAnalysis,
    humanVerdict: 'Approved' | 'Rejected',
    humanNotes: string,
    rubric: string
): Promise<DriftFlag | null> => {
    const ai = getAiClient();
    const aiPassed = aiAnalysis.checklist.every(item => item.passed);
    
    // Quick check: If verdicts align, no drift.
    if ((aiPassed && humanVerdict === 'Approved') || (!aiPassed && humanVerdict === 'Rejected')) {
        return null;
    }

    const prompt = `You are a Compliance Quality Auditor for an LMS.
A Human Reviewer just ${humanVerdict} a submission, but the AI Proctor had a different verdict (AI Passed: ${aiPassed}).

RUBRIC: "${rubric}"
AI ANALYSIS: ${JSON.stringify(aiAnalysis)}
HUMAN NOTES: "${humanNotes}"

Determine if there is a fundamental contradiction (Drift).
1. If the human identified something the AI missed (or vice versa), explain why.
2. Rate the severity of the drift (High/Medium/Low).

OUTPUT: A JSON object with 'severity', 'reason', 'aiVerdict' (Pass/Fail), 'humanVerdict' (Approved/Rejected). 
If it's just a minor difference in style, return null for severity.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        severity: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        reason: { type: Type.STRING },
                        aiVerdict: { type: Type.STRING },
                        humanVerdict: { type: Type.STRING }
                    },
                    required: ["severity", "reason", "aiVerdict", "humanVerdict"]
                }
            }
        });
        const result = JSON.parse(response.text!.trim());
        return { ...result, timestamp: Date.now() };
    } catch (e) {
        console.error("Drift detection failed:", e);
        return null;
    }
};

/**
 * generateCourseThumbnail: Generates a high-quality professional cover image for a course.
 */
export const generateCourseThumbnail = async (courseTitle: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `A highly professional, minimalist 3D isometric icon representing "${courseTitle}" safety and operational training. 
    Use a clean studio background with soft cinematic lighting. Style: High-end tech startup aesthetic, vibrant colors matching the topic.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio: "16:9"
                }
            }
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image part returned");
    } catch (e) {
        console.error("Thumbnail gen error:", e);
        return `https://placehold.co/600x400/1e293b/ffffff?text=${encodeURIComponent(courseTitle)}`;
    }
};

/**
 * generateSopPatch: Creates a Side-by-Side comparison for patching confusing content.
 */
export const generateSopPatch = async (lesson: Lesson, context: string): Promise<SopPatch> => {
    const ai = getAiClient();
    const prompt = `You are a Senior Instructional Designer.
Analyze this confusing SOP: "${lesson.title}".
CONTEXT OF CONFUSION: "${context}"

1. Identify the exact paragraphs or logic causing friction.
2. Draft an optimized version that uses simpler language, bullet points, and clearer warnings.
3. Quantify the improvement (0-100).

ORIGINAL CONTENT:
${lesson.content}

OUTPUT: A JSON object with 'lessonId', 'originalHtml', 'suggestedHtml', 'reasoning', and 'improvementScore'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lessonId: { type: Type.STRING },
                        originalHtml: { type: Type.STRING },
                        suggestedHtml: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        improvementScore: { type: Type.NUMBER }
                    },
                    required: ["lessonId", "originalHtml", "suggestedHtml", "reasoning", "improvementScore"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (e) {
        throw new Error("Patch generation failed.");
    }
};

/**
 * Autopilot Course Engine: Builds a full program from a single URL or Topic using Search Grounding.
 */
export const generateCourseFromWeb = async (sourceUrlOrTopic: string): Promise<{
    lesson: Partial<Lesson>;
    quiz: Partial<Quiz>;
    tags: string[];
    confidence_score: number;
}> => {
    const ai = getAiClient();
    const prompt = `You are a World-Class Instructional Designer.
    Research the following source/topic: "${sourceUrlOrTopic}".
    
    1. Extract the primary safety, operational, or ethical standards.
    2. Write a comprehensive, professional LMS lesson in clean HTML.
    3. Generate 5 difficult multiple-choice questions for a final assessment.
    4. Categorize the content with 3 relevant industry tags.
    5. Provide an alignment confidence score (0-100) based on source quality.

    OUTPUT: A JSON object with 'lesson' (title, content, category), 'quiz' (questions array), 'tags', and 'confidence_score'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lesson: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                content: { type: Type.STRING },
                                category: { type: Type.STRING }
                            },
                            required: ["title", "content", "category"]
                        },
                        quiz: {
                            type: Type.OBJECT,
                            properties: {
                                questions: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            prompt: { type: Type.STRING },
                                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                                            correct_option: { type: Type.INTEGER },
                                            explain: { type: Type.STRING }
                                        },
                                        required: ["prompt", "options", "correct_option"]
                                    }
                                }
                            }
                        },
                        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                        confidence_score: { type: Type.NUMBER }
                    },
                    required: ["lesson", "quiz", "tags", "confidence_score"]
                }
            }
        });
        
        return JSON.parse(response.text!.trim());
    } catch (error) {
        console.error("Autopilot Error:", error);
        throw new Error("Content engine could not ground the request. Check your URL.");
    }
};

/**
 * matchPersonnelToTask: Matches users to a specific task based on their training readiness and cert history.
 */
export const matchPersonnelToTask = async (taskDescription: string, userReadinessData: any[]): Promise<WorkforceMatch[]> => {
    const ai = getAiClient();
    const dataString = JSON.stringify(userReadinessData);
    
    const prompt = `You are a Resource Dispatch AI for a high-compliance organization.
A Manager needs to fill a task with the following requirements: "${taskDescription}".

Below is the readiness data for the personnel. Each entry includes their Name, ID, current status, and specific blockers.
Analyze the task description to identify required skills/certs, then rank the personnel.

PERSONNEL DATA:
${dataString}

OUTPUT: A JSON array of 'WorkforceMatch' objects, each containing:
'userId', 'matchScore' (0-100), 'justification' (short reasoning), 'missingPrerequisites' (array of missing specific training strings), 'metPrerequisites' (array of relevant completed training).
Only return the top 3 matches.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            userId: { type: Type.STRING },
                            matchScore: { type: Type.INTEGER },
                            justification: { type: Type.STRING },
                            missingPrerequisites: { type: Type.ARRAY, items: { type: Type.STRING } },
                            metPrerequisites: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["userId", "matchScore", "justification", "missingPrerequisites", "metPrerequisites"]
                    }
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) {
        console.error("Nexus Error:", error);
        throw new Error("Workforce matching engine unavailable.");
    }
};

/**
 * generateDailySprout: Spaced Repetition Engine
 */
export const generateDailySprout = async (completedLessons: Lesson[]): Promise<SproutQuestion> => {
    const ai = getAiClient();
    const lessonSample = completedLessons.slice(0, 5).map(l => `Title: ${l.title}\nContent Snippet: ${l.content.substring(0, 300).replace(/<[^>]+>/g, '')}`).join('\n\n---\n\n');

    const prompt = `You are an LMS Memory Retention Specialist. 
Below are snippets of lessons a learner has COMPLETED. 
Your goal is to create one tricky, application-based multiple choice question that tests their deeper understanding of the content to ensure they haven't forgotten it.

CONTENT SAMPLES:
${lessonSample}

OUTPUT: A JSON object with 'id', 'lesson_id' (which lesson it's from), 'prompt', 'options' (4 choices), 'correct_option' (index), and 'explanation'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        lesson_id: { type: Type.STRING },
                        prompt: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correct_option: { type: Type.INTEGER },
                        explanation: { type: Type.STRING }
                    },
                    required: ["id", "lesson_id", "prompt", "options", "correct_option", "explanation"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) {
        console.error("Sprout Gen Error:", error);
        throw new Error("Failed to generate Sprout Byte.");
    }
};

/**
 * optimizeContentBasedOnFeedback: Content Optimizer
 */
export const optimizeContentBasedOnFeedback = async (lesson: Lesson, feedbacks: LearnerFeedback[]): Promise<ContentOptimization> => {
    const ai = getAiClient();
    const feedbackText = feedbacks.map(f => `- [Rating ${f.rating}/5]: ${f.comment}`).join('\n');
    
    const prompt = `You are a Senior Instructional Designer.
Below is an SOP lesson and a list of learner feedback regarding it.
Identify patterns in the feedback (where are they getting confused?) and provide an optimized, clearer version of the HTML content.
Preserve all critical safety and operational facts.

ORIGINAL SOP:
${lesson.content}

LEARNER FEEDBACK:
${feedbackText}

OUTPUT: Provide a JSON object with 'suggested_html', 'reasoning' (why you made changes), and 'sentiment_summary'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggested_html: { type: Type.STRING },
                        reasoning: { type: Type.STRING },
                        sentiment_summary: { type: Type.STRING }
                    },
                    required: ["suggested_html", "reasoning", "sentiment_summary"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) {
        console.error("Optimization Error:", error);
        throw new Error("Failed to optimize content.");
    }
};

/**
 * auditSceneAgainstSop: Real-time Environmental Audit
 */
export const auditSceneAgainstSop = async (base64Data: string, sopContent: string): Promise<SceneAudit> => {
    const ai = getAiClient();
    const prompt = `You are a Precision Safety Auditor. 
Analyze the provided image of a workplace environment against the following SOP requirements:
"${sopContent.replace(/<[^>]+>/g, '')}"

Identify any violations, hazards, or deviations from the standard.
Be extremely observant of objects, labeling, and safety equipment.

OUTPUT: Provide a JSON object with 'compliance_score' (0-100), 'violations' (type, label, description, sop_reference), and 'summary'.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        compliance_score: { type: Type.INTEGER },
                        summary: { type: Type.STRING },
                        violations: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ["Critical", "Warning", "Instructional"] },
                                    label: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    sop_reference: { type: Type.STRING }
                                },
                                required: ["type", "label", "description"]
                            }
                        }
                    },
                    required: ["compliance_score", "summary", "violations"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) {
        console.error("Audit Error:", error);
        throw new Error("AI Vision Audit failed. Check lighting and try again.");
    }
};

export const generateMultiSpeakerPodcast = async (lesson: Lesson): Promise<{ script: string, audioBase64: string }> => {
    const ai = getAiClient();
    const scriptPrompt = `You are a Podcast Scriptwriter. 
Turn the following training content into an engaging 2-minute conversation between "Joe" (a curious Site Manager) and "Jane" (a Safety Compliance Expert).
Format the output as a plain text dialogue:
Joe: [Dialogue]
Jane: [Dialogue]

CONTENT: ${lesson.title}. ${lesson.content.replace(/<[^>]+>/g, '')}`;

    const scriptResponse = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: scriptPrompt });
    const script = scriptResponse.text || "";

    const audioResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `TTS the following conversation between Joe and Jane:
        ${script}` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                        { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
                    ]
                }
            }
        }
    });
    const audioBase64 = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    return { script: script, audioBase64: audioBase64 };
};

export const parseDocumentToLesson = async (base64Data: string, mimeType: string): Promise<{
    lesson: Partial<Lesson>;
    quiz: Partial<Quiz>;
}> => {
    const ai = getAiClient();
    const prompt = `You are a Document Digitization Expert. 1. Perform OCR and extract the core instructional content. 2. Format it into clean, professional HTML for an LMS. 3. Create a 3-question multiple choice quiz.`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: { parts: [{ inlineData: { data: base64Data, mimeType: mimeType } }, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lesson: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, category: { type: Type.STRING } }, required: ["title", "content", "category"] },
                        quiz: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correct_option: { type: Type.INTEGER }, explain: { type: Type.STRING } }, required: ["prompt", "options", "correct_option"] } } }, required: ["title", "questions"] }
                    },
                    required: ["lesson", "quiz"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) { throw new Error("Failed."); }
};

export const generateFullProgramBlueprint = async (topic: string): Promise<{
    lesson: Partial<Lesson>;
    quiz: Partial<Quiz>;
    rubric: string;
}> => {
    const ai = getAiClient();
    const prompt = `Build a complete training blueprint for the topic: "${topic}". Include LESSON (HTML), QUIZ (3 MCQs), and PROCTOR RUBRIC (Verbal/Visual checks).`;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lesson: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, content: { type: Type.STRING }, category: { type: Type.STRING } }, required: ["title", "content", "category"] },
                        quiz: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correct_option: { type: Type.INTEGER }, explain: { type: Type.STRING } }, required: ["prompt", "options", "correct_option"] } } }, required: ["title", "questions"] },
                        rubric: { type: Type.STRING }
                    },
                    required: ["lesson", "quiz", "rubric"]
                }
            }
        });
        return JSON.parse(response.text!.trim());
    } catch (error) { throw new Error("Failed."); }
};

export const generateRemediationLesson = async (quiz: Quiz, attempt: QuizAttempt, originalLessonContent: string): Promise<string> => {
    const ai = getAiClient();
    const missedDetails = quiz.questions.map(q => {
        const userAnswer = attempt.answers[q.id];
        if (userAnswer !== q.correct_option) {
            return `Question: ${q.prompt}\nLearner's Wrong Choice: ${q.options[userAnswer]}\nCorrect Answer was: ${q.options[q.correct_option]}`;
        }
        return null;
    }).filter(Boolean).join('\n\n');
    const prompt = `Remediation for: ${missedDetails}. Context: ${originalLessonContent.replace(/<[^>]+>/g, '')}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return response.text || "<p>Please review the main lesson again.</p>";
    } catch (error) { return "<p>Offline.</p>"; }
};

export const translateContent = async (html: string, targetLanguage: string): Promise<string> => {
    const ai = getAiClient();
    const prompt = `Translate HTML content into ${targetLanguage}. Preserve tags. CONTENT: ${html}`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return response.text || html;
    } catch (error) { return html; }
};

export const generateSpeechForText = async (text: string): Promise<string> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Read: ${text.replace(/<[^>]+>/g, '')}` }] }],
            config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } } }
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
    } catch (error) { throw error; }
};

export const generateAnswer = async (query: string, context: Hit[]): Promise<{ text: string, detectedLanguage: string }> => {
  const ai = getAiClient();
  const contextString = context.map(hit => `Lesson: ${hit.lesson.title}\nContent: ${hit.lesson.content.replace(/<[^>]+>/g, " ")}\n\n`).join('').slice(0, 10000);
  
  const prompt = `You are the Canopy Learn AI Tutor. 
  1. Detect the language of the following QUESTION: "${query}".
  2. Answer the question based ONLY on the provided CONTEXT. 
  3. Respond in the SAME LANGUAGE as the question. 
  4. If you cannot find the answer in the context, politely say so in the detected language.

  CONTEXT:
  ${contextString}

  OUTPUT: A JSON object with 'text' (your answer) and 'detectedLanguage' (e.g. 'English', 'French').`;

  try {
    const response = await ai.models.generateContent({ 
        model: 'gemini-3-flash-preview', 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    detectedLanguage: { type: Type.STRING }
                },
                required: ["text", "detectedLanguage"]
            }
        }
    });
    return JSON.parse(response.text!.trim());
  } catch (error) { 
      return { text: "Connection error. Error de connection.", detectedLanguage: "Unknown" }; 
  }
};

export const generateComplianceAuditAnswer = async (query: string, certificates: Certificate[], programs: Program[], policies: Policy[]): Promise<string> => {
    const ai = getAiClient();
    const certContext = certificates.map(c => `- Cert ID: ${c.certificate_id}, Program: ${c.name}, Status: ${c.status}`).join('\n');
    const prompt = `You are the Canopy Compliance Officer AI. REGISTRY: ${certContext}\nQUESTION: "${query}"`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        return response.text || "Registry busy.";
    } catch (error) { return "Offline."; }
};

export const generateQuiz = async (lesson: Lesson): Promise<QuizItem[]> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Quiz for: "${lesson.title}". CONTENT: ${lesson.content.replace(/<[^>]+>/g, " ")}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.OBJECT, properties: { q: { type: Type.STRING }, choices: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.INTEGER }, explain: { type: Type.STRING } }, required: ["q", "choices", "answer", "explain"] }
        }
      }
    });
    return JSON.parse(response.text!.trim()) as QuizItem[];
  } catch (error) { throw new Error("Failed."); }
};

export const generateTrainerInsights = async (questions: string[], programs: Program[]): Promise<TrainerInsight> => {
  const ai = getAiClient();
  const programContext = programs.map(p => `- ${p.title} (ID: ${p.program_id})`).join('\n');
  const prompt = `Analyze these learner questions: ${questions.join('\n')}. 
  CROSS-REFERENCE WITH PROGRAMS:
  ${programContext}

  Identify knowledge gaps and provide specific sentiment tracking for the programs.
  Identify which programs/lessons might be confusing.

  OUTPUT: A JSON object with:
  'frequentQuestions', 'knowledgeGaps', 'courseSentiment' (array with lessonId, title, score 0-5, status), 'globalRecommendations'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT, 
          properties: { 
              frequentQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }, 
              knowledgeGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
              courseSentiment: { 
                  type: Type.ARRAY, 
                  items: { 
                      type: Type.OBJECT, 
                      properties: { 
                          lessonId: { type: Type.STRING }, 
                          title: { type: Type.STRING }, 
                          score: { type: Type.NUMBER }, 
                          status: { type: Type.STRING } 
                      } 
                  } 
              },
              globalRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          }, 
          required: ["frequentQuestions", "knowledgeGaps", "courseSentiment", "globalRecommendations"]
        }
      }
    });
    return JSON.parse(response.text!.trim());
  } catch (error) { throw new Error("Failed."); }
};

export const generateRolePlayFeedback = async (transcript: TranscriptionTurn[], program: Program): Promise<RolePlayFeedback> => {
  const ai = getAiClient();
  try {
     const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Feedback on role-play: ${program.title}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT, properties: { summary: { type: Type.STRING }, positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } }, improvementAreas: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["summary", "positivePoints", "improvementAreas"]
        }
      }
    });
    return JSON.parse(response.text!.trim()) as RolePlayFeedback;
  } catch(error) { throw new Error("Failed."); }
};

export const generateSop = async (prompt: string, useSearch: boolean = false): Promise<SopDraft> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Create Lesson for: ${prompt}.`,
            config: {
                tools: useSearch ? [{ googleSearch: {} }] : undefined,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: { title: { type: Type.STRING }, sections: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { heading: { type: Type.STRING }, html: { type: Type.STRING } }, required: ["heading", "html"] } } }, required: ["title", "sections"]
                }
            }
        });
        return JSON.parse(response.text!.trim()) as SopDraft;
    } catch (error) { throw new Error("Failed."); }
};

export const generateTrainingVideo = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        let op = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' } });
        while (!op.done) { await new Promise(r => setTimeout(r, 5000)); op = await ai.operations.getVideosOperation({operation: op}); }
        return `${op.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
    } catch (error) { throw new Error("Failed."); }
};

export const analyzePracticalVideo = async (imageData: string | undefined, rubric: string | undefined): Promise<VideoAnalysis> => {
    if (!imageData) return { summary: "Good demo.", checklist: [{ step: "Check", passed: true }] };
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { mimeType: 'image/png', data: imageData } }, { text: `Rubric: ${rubric}` }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: { summary: { type: Type.STRING }, checklist: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { step: { type: Type.STRING }, passed: { type: Type.BOOLEAN }, reason: { type: Type.STRING } }, required: ["step", "passed"] } } }, required: ["summary", "checklist"]
                }
            }
        });
        return JSON.parse(response.text!.trim()) as VideoAnalysis;
    } catch (error) { throw new Error("Failed."); }
};