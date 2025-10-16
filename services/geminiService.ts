import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types.js';

let ai: GoogleGenAI;

function getAi() {
    if (!ai) {
        // This will now throw an error only when a gemini function is called,
        // preventing the app from crashing on load.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}

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
    
    let textResponse = '';
    try {
        const response = await getAi().models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recipeSchema,
            },
        });

        textResponse = response.text;
        
        let jsonString = textResponse;

        // The model can sometimes return non-JSON text around the JSON array.
        // We'll extract the content between the first '[' and the last ']'.
        const startIndex = jsonString.indexOf('[');
        const endIndex = jsonString.lastIndexOf(']');

        if (startIndex !== -1 && endIndex > startIndex) {
            jsonString = jsonString.substring(startIndex, endIndex + 1);
        }

        // Now, attempt to parse the extracted string.
        const recipeData = JSON.parse(jsonString);
        return recipeData as Recipe[];

    } catch (error) {
        console.error("Error generating recipe:", error);
        // If parsing fails, log the raw text from the API for debugging.
        if (textResponse) {
             console.error("Raw response text that failed to parse:", textResponse);
        }
        throw new Error("عذرًا، حدث خطأ غير متوقع أثناء إنشاء الوصفة. يرجى المحاولة مرة أخرى.");
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
        console.error("Error generating image:", error);
        // لا تقم برمي خطأ يوقف التطبيق، فقط قم بإرجاع سلسلة فارغة
        return "";
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
        console.error("Error generating variations:", error);
        throw new Error("فشل في اقتراح تنويعات.");
    }
};