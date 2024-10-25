const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc} = require('firebase/firestore');
const bcrypt = require('bcrypt');
require('dotenv').config();


const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();

// Configuracion Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SUPPORT_EMAIL, 
      pass: process.env.SUPPORT_EMAIL_APP_PASSWORD, 
    },
});

app.use(cors()); // Permite hacer peticiones desde cualquier origen
app.use(express.json());

// Ruta para registro de usuario

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const existingUser = querySnapshot.docs.find(doc => doc.data().email === email);

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const userId = email;
        const newUser = {
            username,
            email,
            password: hashedPassword,
            knowledge_points: 0,
            following: []
        };

        await setDoc(doc(db, 'users', userId), newUser);

        res.status(201).json({message: 'Usuario registrado con exito'});
    } catch(error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({error: 'Error al registrar el usuario'});
    }
});

// Iniciar sesión

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userDoc = querySnapshot.docs.find(doc => doc.data().email === email);
        
        if (!userDoc) {
            return res.status(401).json({ error: 'Email de usuario no encontrado' });
        }

        const user = userDoc.data();
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        res.status(200).json({ message: 'Inicio de sesión ejecutado con éxito', username: user.username });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }

});

// Obtener datos de questions
app.get('/data', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'questions'));
        const data = querySnapshot.docs.map(doc => doc.data());
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error al obtener las preguntas' });
    }
});

// Añadir preguntas
app.post('/addquestions', async (req, res) => {
    try {
        const questions = req.body;
        
        if (!Array.isArray(questions)) {
            throw new Error('El cuerpo de la solicitud debe ser un array de preguntas.');
        }

        for (const question of questions) {
            const { id, image, ...data } = question;
            if (!id) {
                throw new Error('Cada pregunta debe tener un campo "id".');
            }
            const questionDoc = {
                ...data,
                ...(image && { image })
            };

            await setDoc(doc(db, 'questions', id), questionDoc);
        }
        res.status(200).json({ message: 'Preguntas añadidas' });
    } catch (error) {
        console.error('Error al añadir preguntas:', error);
        res.status(500).json({ error: 'Error al añadir preguntas' });
    }
});

// Obtener datos de categories
app.get('/datacategories', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const data = querySnapshot.docs.map(doc => doc.data());
        res.json(data);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error al obtener categorias' });
    }
});

// Añadir categorías
app.post('/addcategories', async (req, res) => {
    try {
        const categories = req.body;

        if (!Array.isArray(categories)) {
            throw new Error('El cuerpo de la solicitud debe ser un array de categorías.');
        }

        for (const category of categories) {
            const { id, ...data } = category;
            if (!id) {
                throw new Error('Cada categoria debe tener un campo "id".');
            }
            setDoc(doc(db, 'categories', id), data);
        }

        res.status(200).json({ message: 'Categorías añadidas' });
    } catch (error) {
        console.error('Error al añadir categorías:', error);
        res.status(500).json({ error: 'Error al añadir categorías' });
    }
});

// Usuarios de Leaderboard

app.get('/leaderboard', async (req, res) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));

        const users = querySnapshot.docs.map(doc => ({
            username: doc.data().username,
            knowledgePoints: doc.data().knowledge_points
        }));

        users.sort((a, b) => b.knowledgePoints - a.knowledgePoints);

        res.status(200).json(users);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});

// Usuarios de Leaderboard por jugador para dividir en ligas

const calculateLeague = (knowledgePoints) => {
    if (knowledgePoints >= 1000) {
        return 'Platinum';
      } else if (knowledgePoints >= 600) {
        return 'Diamond';
      } else if (knowledgePoints >= 300) {
        return 'Gold';
      } else if (knowledgePoints >= 100) {
        return 'Silver';
      } else {
        return 'Bronze';
      }
};

app.get('/leaderboard/:username', async (req, res) => {
        const { username } = req.params;
  
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const currentUserDoc = querySnapshot.docs.find(doc => doc.data().username === username);
  
        if (!currentUserDoc) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
  
        const currentUser = currentUserDoc.data();
        const currentUserPoints = currentUser.knowledge_points;
        const currentLeague = calculateLeague(currentUserPoints);

        // Obtener todos los jugadores
        const allPlayers = querySnapshot.docs.map(doc => ({
            username: doc.data().username,
            knowledgePoints: doc.data().knowledge_points
        }));

        // Filtrar los que se siguen
        const followingPlayers = allPlayers
            .filter(player => currentUser.following && currentUser.following.includes(player.username))
            .sort((a, b) => b.knowledgePoints - a.knowledgePoints);

        // Filtrar por liga
        const sortedPlayers = allPlayers
            .filter(player => calculateLeague(player.knowledgePoints) === currentLeague)
            .sort((a, b) => b.knowledgePoints - a.knowledgePoints);

  
        res.status(200).json({currentLeague, sortedPlayers, followingPlayers});
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Error al obtener la tabla de clasificación' });
    }
});

// Seguir a un jugador
app.post('/follow/:username/:playerToFollow', async (req, res) => {
    const { username, playerToFollow } = req.params;
  
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const currentUserDoc = querySnapshot.docs.find(doc => doc.data().username === username);
      const playerDoc = querySnapshot.docs.find(doc => doc.data().username === playerToFollow);
  
      // Verificar si el usuario y el jugador a seguir existen
      if (!currentUserDoc) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      if (!playerDoc) {
        return res.status(404).json({ error: 'Jugador a seguir no encontrado' });
      }
  
      const currentUser = currentUserDoc.data();
      
      // Verificar si ya se sigue al jugador
      if (currentUser.following && currentUser.following.includes(playerToFollow)) {
        return res.status(400).json({ error: 'Ya se sigue a este jugador' });
      }
  
      const updatedFollowing = [...(currentUser.following || []), playerToFollow];
      
      await setDoc(currentUserDoc.ref, { following: updatedFollowing }, { merge: true });
  
      res.status(200).json({ success: true, updatedFollowing });
    } catch (error) {
      console.error('Error following player:', error);
      res.status(500).json({ error: 'Error al seguir al jugador' });
    }
});

// Dejar de seguir a un jugador
app.post('/unfollow/:username/:playerToUnfollow', async (req, res) => {
    const { username, playerToUnfollow } = req.params;

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const currentUserDoc = querySnapshot.docs.find(doc => doc.data().username === username);
        
        // Verificar si el usuario existe
        if (!currentUserDoc) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const currentUser = currentUserDoc.data();
        
        // Verificar si el jugador a dejar de seguir está en la lista de seguidos
        if (!currentUser.following || !currentUser.following.includes(playerToUnfollow)) {
            return res.status(400).json({ error: 'El usuario no sigue a este jugador' });
        }

        // Filtrar el jugador a dejar de seguir
        const updatedFollowing = currentUser.following.filter(player => player !== playerToUnfollow);
        
        await setDoc(currentUserDoc.ref, { following: updatedFollowing }, { merge: true });

        res.status(200).json({ success: true, updatedFollowing });
    } catch (error) {
        console.error('Error unfollowing player:', error);
        res.status(500).json({ error: 'Error al dejar de seguir al jugador' });
    }
});

// Solicitud de info de usuario para perfil

app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const currentUserDoc = querySnapshot.docs.find(doc => doc.data().username === username);

        if (!currentUserDoc) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const currentUser = currentUserDoc.data();

        const profileData = {
            username: currentUser.username,
            knowledgePoints: currentUser.knowledge_points,
            league: calculateLeague(currentUser.knowledge_points),
            avatar: currentUser.avatar || null // Implementacion a futuro
        };

        res.status(200).json(profileData);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error al hacer fetch del perfil' });
    }
});

// Obtencion de puntos de usuario

app.get('/getUserPoints/:username', async (req, res) => {
    const { username } = req.params;
  
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const userDoc = querySnapshot.docs.find(doc => doc.data().username === username);
  
        if (!userDoc) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
  
        const userPoints = userDoc.data().knowledge_points;
        res.status(200).json({ knowledge_points: userPoints });
    } catch (error) {
        console.error('Error fetching user points:', error);
        res.status(500).json({ error: 'Error al obtener los puntos del usuario' });
    }
});

// Actualización de puntuaje del ranking

app.post('/updatePoints', async (req, res) => {
    const { username, newPoints } = req.body;
  
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userDoc = querySnapshot.docs.find(doc => doc.data().username === username);
  
      if (!userDoc) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
  
      const userRef = doc(db, 'users', userDoc.id);
      await setDoc(userRef, { knowledge_points: newPoints }, { merge: true });
  
      res.status(200).json({ message: 'Puntos actualizados correctamente' });
    } catch (error) {
      console.error('Error actualizando los puntos:', error);
      res.status(500).json({ error: 'Error actualizando los puntos' });
    }
}); 

// Recibir sugerencia de categoría
app.post('/suggestcategory', async (req, res) => {
    const { categoryName, categoryDescription, username } = req.body;
  
    if (!categoryName || !categoryDescription) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
  
    try {
      const mailOptions = {
        from: process.env.SUPPORT_EMAIL,
        to: process.env.SUPPORT_EMAIL, 
        subject: 'Nueva sugerencia de categoría',
        text: `El usuario ${username} ha sugerido una nueva categoría:
               Nombre de la categoría: ${categoryName}
               Descripción: ${categoryDescription}`,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ message: 'Sugerencia enviada correctamente' });
    } catch (error) {
      console.error('Error enviando sugerencia:', error);
      res.status(500).json({ error: 'Error enviando la sugerencia' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
