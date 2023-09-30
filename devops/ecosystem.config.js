module.exports = {
    apps: [
        {
            name: "API Gateway",
            script: "./code/svc_gateway/src/index.js"
        },
        {
            name: "EXTERNO - Servicio de Autenticación",
            script: "./code/external_svcs/fed_ed/index.js"
        },
        {
            name: "EXTERNO - Unidad Reguladora",
            script: "./code/external_svcs/RegUnit/index.js"
        },
        {
            name: "EXTERNO - Pasarela de Pagos",
            script: "./code/external_svcs/CustomPayment/index.js"
        },
        {
            name: "EXTERNO - Servicio de monedas y países",
            script: "./code/external_svcs/CountryCityCoin/index.js"
        },
        {
            name: "Servicio de Mails",
            script: "./code/svc_mail/index.js"
        },
        {
            name: "Servicio de Logs",
            script: "./code/svc_log/index.js"
        },
        {
            name: "Servicio de Files",
            script: "./code/svc_file/index.js",
            instances: 2
        },
        {
            name: "Servicio de Eventos",
            script: "./code/svc_evento/index.js",
            instances: 2
        },
        {
            name: "Servicio de Bitácora",
            script: "./code/svc_bitacora/index.js"
        },
        {
            name: "Servicio de Autenticación y Autorización",
            script: "./code/svc_auth/index.js"
        },
        {
            name: "Servicio de Administrador",
            script: "./code/svc_admin/index.js"
        }
    ]
}