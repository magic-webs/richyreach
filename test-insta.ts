import { fetchInstagramProfile } from './src/server/utils/instagram-api'; 
fetchInstagramProfile('revas.overseas').then(console.log).catch(console.error);
