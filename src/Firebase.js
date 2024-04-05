import {initializeApp} from "firebase/app";
import { getDatabase, ref, onValue, query, orderByKey, startAt, endAt, limitToFirst, limitToLast } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBocruseuFcVhWbUIJoIhxUXF_6p8WzoPo",
  authDomain: "x-project-a5ecf.firebaseapp.com",
  databaseURL: "https://x-project-a5ecf-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "x-project-a5ecf",
  storageBucket: "x-project-a5ecf.appspot.com",
  messagingSenderId: "768841134394",
  appId: "1:768841134394:web:e1e1fd498783ee272ae003",
  measurementId: "G-DMGM5JJPT8"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export const GetClientData = (clientId, callback) => onValue(ref(database, clientId + '/Data'), callback)
export const GetData = (clientId, unitId, type, metric, start, end, callback) => onValue(query(ref(database, clientId + '/' + unitId + "/" + type + "/" + metric), orderByKey(), startAt((start / 1000).toString()), endAt((end / 1000).toString())), callback);
export const GetFirstDate = (clientId, unitId, type, metric, callback) => GetLimitDate(limitToFirst, clientId, unitId, type, metric, callback)
export const GetLastDate = (clientId, unitId, type, metric, callback) => GetLimitDate(limitToLast, clientId, unitId, type, metric, callback)
const GetLimitDate = (limitToFunc, clientId, unitId, type, metric, callback) => onValue(query(ref(database, clientId + "/" + unitId + "/" + type + "/" + metric), limitToFunc(1)), snapshot => snapshot.forEach(s => callback(parseInt(s.key) * 1000)))

export const Login = async (mail, password, onSuccess, onFailled) => {
  try {
    onSuccess(await signInWithEmailAndPassword(auth, mail, password))
  } catch (err) { onFailled(err) }
}

export default app;