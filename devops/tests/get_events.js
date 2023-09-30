import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
    vus: 30,
    duration: '60s',
};

export function setup() {
    let userToken, providerToken, adminToken = '';

    let loginAdminRes = http.post('http://localhost:3000/login', JSON.stringify({
        "email": "john.doe@example.com",
        "password": "P4ssw0rd1"
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginAdminRes, {
        'logged in successfully': (resp) => resp.json('token') !== '',
    });

    adminToken = loginAdminRes.json('token');

    let loginProviderRes = http.post('http://localhost:3000/login', JSON.stringify({
        "email": "jane.smith@example.com",
        "password": "P4ssw0rd2"
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginProviderRes, {
        'logged in successfully': (resp) => resp.json('token') !== '',
    });

    providerToken = loginProviderRes.json('token');

    let loginUserRes = http.post('http://localhost:3000/login', JSON.stringify({
        "email": "oliver.martin@example.com",
        "password": "P4ssw0rd19"
    }), { headers: { 'Content-Type': 'application/json' } });

    check(loginUserRes, {
        'logged in successfully': (resp) => resp.json('token') !== '',
    });

    userToken = loginUserRes.json('token');

    return { adminToken, providerToken, userToken };
}

export default function (data) {
    let adminHeaders = {
        'authorization': `${data.adminToken}`,
        'Content-Type': 'application/json'
    };

    let providerHeaders = {
        'authorization': `${data.providerToken}`,
        'Content-Type': 'application/json'
    };  

    let userHeaders = {
        'authorization': `${data.userToken}`,
        'Content-Type': 'application/json'
    };

    let res;

    res = http.get('http://localhost:4003/svc_file/video/1687047123084-945-video.mp4', { headers: userHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:4003/svc_file/video/1687047123084-945-video.mp4');
    }

    res = http.get('http://localhost:5100/svc_evento/evento/1/proveedor', { headers: providerHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:5100/svc_evento/evento/1/proveedor');
    }

    res = http.get('http://localhost:5100/svc_evento/evento_admin_bitacora?from=1-1-2020&until=12-12-2024', { headers: adminHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:5100/svc_evento/evento_admin_bitacora?from=1-1-2020&until=12-12-2024');
    }

    res = http.get('http://localhost:5100/svc_evento/evento_admin', { headers: adminHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:5100/svc_evento/evento_admin');
    }

    res = http.get('http://localhost:5100/svc_evento/evento', { headers: userHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:5100/svc_evento/evento');
    }

    res = http.get('http://localhost:5100/svc_evento/evento_provider/1', { headers: providerHeaders });
    if (!check(res, {'status was 200': (r) => r.status == 200})) {
        console.log('Check failed for url http://localhost:5100/svc_evento/evento_provider/1');
    }

    sleep(1);
}