import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { answers } = body;

        if (!answers || !Array.isArray(answers) || answers.length !== 10) {
            return NextResponse.json({ error: 'Invalid answers provided' }, { status: 400 });
        }

        // Calculate total score (all answers are 1-4 points)
        const totalScore = answers.reduce((sum, val) => sum + val, 0);

        let level = 0;
        let title = '';
        let message = '';
        let recommendations: string[] = [];

        if (totalScore >= 10 && totalScore <= 16) {
            level = 1;
            title = 'Data Beginner';
            message = 'Jullie organisatie staat aan het begin van de data-journey. Goed nieuws: de stap van chaos naar inzicht is kleiner dan je denkt. Power BI kan binnen 4 weken je eerste dashboard live hebben.';
            recommendations = [
                'Centraliseer jullie belangrijkste data uit Excel naar één beveiligde omgeving.',
                'Kies één afdeling (bijv. Sales of Finance) voor een eerste overzichtelijk pilot-dashboard.',
                'Laat een specialist het fundament leggen om wildgroei aan formulieren te voorkomen.'
            ];
        } else if (totalScore >= 17 && totalScore <= 24) {
            level = 2;
            title = 'Data Aware';
            message = 'Jullie zien de waarde van data maar missen structuur en richting. Dit is het ideale moment om een BI-fundament te leggen voordat de complexiteit toeneemt.';
            recommendations = [
                'Standaardiseer KPI-definities zodat het hele MT met dezelfde cijfers spreekt.',
                'Vervang de handmatige export/import processen door geautomatiseerde ETL flows.',
                'Implementeer Workspace en App structuren in Power BI voor de juiste toegangsrechten.'
            ];
        } else if (totalScore >= 25 && totalScore <= 32) {
            level = 3;
            title = 'Data Driven';
            message = 'Jullie werken al datagedreven maar er liggen nog grote kansen in automatisering en AI-integratie. De volgende stap: laat data voor je werken in plaats van andersom.';
            recommendations = [
                'Optimaliseer bestaande DAX complexe modellen en migreer naar een centrale Semantic Model architectuur.',
                'Exploreer realtime streaming dashboards voor operationele processen.',
                'Stel een formele Data Governance rol of structuur in.'
            ];
        } else if (totalScore >= 33 && totalScore <= 40) {
            level = 4;
            title = 'Data & AI Ready';
            message = 'Jullie hebben een volwassen datafundament. Tijd om AI-functionaliteiten toe te voegen aan jullie Power BI omgeving voor predictieve inzichten en automatische narratives.';
            recommendations = [
                'Implementeer Copilot in Fabric of integratie met Azure OpenAI voor natural language bevragingen.',
                'Voeg predictieve machine learning modellen toe als fundament aan je bestaande rapportages.',
                'Scale out met Microsoft Fabric voor one-lake concepten.'
            ];
        }

        return NextResponse.json({
            score: totalScore,
            level,
            title,
            message,
            recommendations
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
