const { runQuery } = require('../config/db_connection');

const AGENTS_TABLE_SQL = `
    CREATE TABLE IF NOT EXISTS tbl_agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'inbound',
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        first_message TEXT,
        system_prompt TEXT,
        model_json TEXT,
        voice_json TEXT,
        transcriber_json TEXT,
        knowledge_base_ids_json TEXT,
        metrics_json TEXT,
        auto_bindings_json TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
`;

const ensureAgentsTable = () => runQuery(AGENTS_TABLE_SQL);

const safeJsonParse = (value, fallback) => {
    if (!value) return fallback;

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

const normalizeDate = (value) => {
    if (!value) return null;

    return new Date(value).toISOString().split('T')[0];
};

const normalizeAgent = (agent) => ({
    id: String(agent.id),
    name: agent.name,
    type: agent.type,
    status: agent.status,
    firstMessage: agent.first_message || '',
    systemPrompt: agent.system_prompt || '',
    model: safeJsonParse(agent.model_json, {}),
    voice: safeJsonParse(agent.voice_json, {}),
    transcriber: safeJsonParse(agent.transcriber_json, {}),
    knowledgeBaseIds: safeJsonParse(agent.knowledge_base_ids_json, []),
    metrics: safeJsonParse(agent.metrics_json, {
        totalCalls: 0,
        averageDuration: '0m 0s',
        successRate: 0,
        lastUsed: 'Never'
    }),
    autoBindings: safeJsonParse(agent.auto_bindings_json, {}),
    createdAt: normalizeDate(agent.created_at),
    updatedAt: normalizeDate(agent.updated_at)
});

const buildAgentPayload = (agentData) => {
    const model = agentData.model || {
        provider: agentData.modelProvider || 'openai',
        model: agentData.modelName || 'gpt-4o',
        temperature: agentData.temperature ?? 0.7,
        maxTokens: agentData.maxTokens ?? 250
    };

    const voice = agentData.voice || {
        provider: agentData.voiceProvider || 'elevenlabs',
        voiceId: agentData.voiceId || '',
        speed: agentData.speed ?? 1
    };

    const transcriber = agentData.transcriber || {
        provider: agentData.transcriberProvider || 'deepgram',
        model: agentData.transcriberModel,
        language: agentData.transcriberLang || agentData.language || 'en-US'
    };

    return {
        name: agentData.name,
        type: agentData.type || 'inbound',
        status: agentData.status || 'active',
        firstMessage: agentData.firstMessage || agentData.first_message || '',
        systemPrompt: agentData.systemPrompt || agentData.system_prompt || '',
        model,
        voice,
        transcriber,
        knowledgeBaseIds: agentData.knowledgeBaseIds || agentData.knowledge_base_ids || [],
        metrics: agentData.metrics || {
            totalCalls: 0,
            averageDuration: '0m 0s',
            successRate: 0,
            lastUsed: 'Never'
        },
        autoBindings: agentData.autoBindings || agentData.auto_bindings || {}
    };
};

const getAgentById = (id) => {
    return ensureAgentsTable()
        .then(() => runQuery('SELECT * FROM tbl_agents WHERE id = ? LIMIT 1', [id]))
        .then((agents) => agents[0] ? normalizeAgent(agents[0]) : null);
};

const createAgent = (agentData) => {
    const payload = buildAgentPayload(agentData);

    return ensureAgentsTable()
        .then(() => runQuery(`
            INSERT INTO tbl_agents (
                name, type, status, first_message, system_prompt,
                model_json, voice_json, transcriber_json,
                knowledge_base_ids_json, metrics_json, auto_bindings_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            payload.name,
            payload.type,
            payload.status,
            payload.firstMessage,
            payload.systemPrompt,
            JSON.stringify(payload.model),
            JSON.stringify(payload.voice),
            JSON.stringify(payload.transcriber),
            JSON.stringify(payload.knowledgeBaseIds),
            JSON.stringify(payload.metrics),
            JSON.stringify(payload.autoBindings)
        ]))
        .then((result) => getAgentById(result.insertId));
};

const listAgents = () => {
    return ensureAgentsTable()
        .then(() => runQuery('SELECT * FROM tbl_agents ORDER BY id DESC'))
        .then((agents) => agents.map(normalizeAgent));
};

const updateAgent = (id, agentData) => {
    const payload = buildAgentPayload(agentData);

    return ensureAgentsTable()
        .then(() => runQuery(`
            UPDATE tbl_agents SET
                name = ?,
                type = ?,
                status = ?,
                first_message = ?,
                system_prompt = ?,
                model_json = ?,
                voice_json = ?,
                transcriber_json = ?,
                knowledge_base_ids_json = ?,
                metrics_json = ?,
                auto_bindings_json = ?
            WHERE id = ?
        `, [
            payload.name,
            payload.type,
            payload.status,
            payload.firstMessage,
            payload.systemPrompt,
            JSON.stringify(payload.model),
            JSON.stringify(payload.voice),
            JSON.stringify(payload.transcriber),
            JSON.stringify(payload.knowledgeBaseIds),
            JSON.stringify(payload.metrics),
            JSON.stringify(payload.autoBindings),
            id
        ]))
        .then((result) => {
            if (result.affectedRows === 0) return null;

            return getAgentById(id);
        });
};

module.exports = {
    createAgent,
    listAgents,
    getAgentById,
    updateAgent
};
