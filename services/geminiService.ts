import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types.js';

let ai: GoogleGenAI;

function getAi() {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

// Centralized error handler
const handleApiError = (error: any, context: string): never => {
    console.error(`Error during ${context}:`, error);
    const errorMessage = error.message?.toLowerCase() || '';

    if (errorMessage.includes('api key') || errorMessage.includes('permission denied')) {
        throw new Error("حدث خطأ في الاتصال بالخدمة. يرجى التأكد من أن التطبيق مهيأ بشكل صحيح للعمل في بيئة النشر.");
    }
    
    throw new Error(`عذرًا، حدث خطأ غير متوقع أثناء ${context}. يرجى المحاولة مرة أخرى.`);
};


const recipeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "عنوان الوصفة باللغة العربية" },
            description: { type: Type.STRING, description: "وصف قصير للوصفة باللغة العربية" },
            ingredients: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "قائمة المكونات المطلوبة للوصفة باللغة العربية"
            },
            instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "خطوات التحضير بالتفصيل باللغة العربية"
            },
            servings: { type: Type.STRING, description: "عدد الأفراد الذين تكفيهم الوصفة" },
            prepTime: { type: Type.STRING, description: "الوقت اللازم للتحضير" },
            calories: { type: Type.STRING, description: "تقدير السعرات الحرارية الإجمالية للطبق" },
            protein: { type: Type.STRING, description: "تقدير كمية البروتين بالجرام" },
            carbs: { type: Type.STRING, description: "تقدير كمية الكربوهيدرات بالجرام" },
            fat: { type: Type.STRING, description: "تقدير كمية الدهون بالجرام" },
        },
        required: ["title", "description", "ingredients", "instructions", "servings", "prepTime"]
    }
};

export const generateRecipe = async (ingredients: string[], dietaryRestrictions: string[], recipeCount: number): Promise<Recipe[]> => {
    const ingredientsString = ingredients.join(', ');
    
    let restrictionsString = '';
    if (dietaryRestrictions.length > 0) {
        restrictionsString = `يجب أن تلتزم جميع الوصفات بالقيود الغذائية التالية بشكل صارم: ${dietaryRestrictions.join('، ')}.`;
    }

    const prompt = `
        أنت طاهٍ خبير وخبير تغذية متخصص في المطبخ العربي.
        مهمتك هي إنشاء ${recipeCount} ${recipeCount === 1 ? 'وصفة' : 'وصفات'} طعام شهية ومبتكرة ومتنوعة باللغة العربية باستخدام قائمة المكونات المقدمة فقط.
        لا تفترض وجود أي مكونات أخرى غير المذكورة (باستثناء الملح والفلفل والماء والزيت).
        
        المكونات المتاحة: ${ingredientsString}.
        ${restrictionsString}

        يرجى تقديم الوصفات بالكامل في شكل مصفوفة JSON. يجب أن تكون جميع النصوص باللغة العربية الفصحى.
        تأكد من أن كل وصفة منطقية ويمكن تحضيرها بالمكونات المتاحة فقط.
        لكل وصفة، قم بتضمين تحليل غذائي تقديري يشمل: السعرات الحرارية، البروتين، الكربوهيدرات، والدهون.
    `;
    
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        const textResponse = response.text;
        
        let jsonString = textResponse;

        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');

        if (startIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }

        const recipeData = JSON.parse(jsonString);
        return recipeData as Recipe[];

    } catch (error) {
        handleApiError(error, 'إنشاء الوصفة');
    }
};


export const generateImage = async (recipeTitle: string): Promise<string> => {
    try {
        const response = await getAi().models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `صورة فوتوغرافية احترافية وواقعية لطبق: ${recipeTitle}. يجب أن تبدو الصورة شهية جداً وذات جودة عالية، وبخلفية بسيطة ونظيفة.`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '16:9',
            },
        });
        
        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

        if (base64ImageBytes) {
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        
        throw new Error("لم يتم العثور على بيانات الصورة في استجابة Imagen.");

    } catch (error) {
       handleApiError(error, 'إنشاء الصورة');
    }
};

export const generateVariations = async (recipe: Recipe): Promise<string> => {
    const prompt = `
        بناءً على الوصفة التالية بعنوان "${recipe.title}" ومكوناتها، اقترح 2-3 تنويعات مثيرة للاهتمام.
        على سبيل المثال، كيف يمكن جعلها حارة، أو نباتية، أو استخدام مكون رئيسي مختلف.
        اجعل الرد موجزًا وواضحًا ومباشرًا باللغة العربية.
    `;
     try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        handleApiError(error, 'اقتراح التنويعات');
    }
};