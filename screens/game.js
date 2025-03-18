// CandyCrush.js
// Version JavaScript simplifiée pour React Native

import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, Text, StyleSheet,Image,ImageBackground   } from "react-native";
import { useNavigation , useRoute } from "@react-navigation/native";


function CandyCrush() {
  const navigation = useNavigation();
  const taille = 8;
  const couleurs = ["red", "blue", "green", "yellow"];

  const images = {
    red: require("../assets/barca.png"),
    blue: require("../assets/liverpool.png"),
    green: require("../assets/city.png"),
    yellow: require("../assets/bayern.png"),
  };
  
  const route = useRoute();
  const {username} = route.params;

  // États du jeu
  const [grille, setGrille] = useState([]);
  const [points, setPoints] = useState(0);
  const [debutX, setDebutX] = useState(0);
  const [debutY, setDebutY] = useState(0);
  const [mouvementUtilisateur, setMouvementUtilisateur] = useState(false);
  const [progression, setProgression] = useState(50);
  const [niveau, setNiveau] = useState(1);
  const [partieTerminee, setPartieTerminee] = useState(false);
  const [intervalID, setIntervalID] = useState(null);
  const [meilleurScore , setMeilleurScore] = useState(0);

  // Initialisation du jeu
  useEffect(function () {
    initialiserJeu();
  }, []);


 // Initialisation du jeu avec une grille aléatoire
function initialiserJeu() {
  const nouvelleGrille = [];
  for (let i = 0; i < taille * taille; i++) {
    const couleurAleatoire =
      couleurs[Math.floor(Math.random() * couleurs.length)];
    nouvelleGrille.push(couleurAleatoire);
  }

  setGrille(nouvelleGrille);
  setPoints(0);
  setProgression(50);
  setNiveau(1);
  setPartieTerminee(false);

  demarrerDecompte(1);
}

// Calcule le facteur de vitesse en fonction du niveau
function calculerFacteurVitesse(niveauActuel) {
  let facteur = 4;
  for (let i = 1; i < niveauActuel; i++) {
    facteur += 1;
  }
  return facteur;
}

// Met à jour le meilleur score du joueur si nécessaire
function joueurMeilleurScore(points) {
  if(points > meilleurScore){
    setMeilleurScore(points);
  }
}

// Calcule l'intervalle de temps pour le décompte en fonction du niveau
function calculerInterval(niveauActuel) {
  const facteur = calculerFacteurVitesse(niveauActuel);
  return 3000 / facteur;
}

// Démarre un décompte qui diminue la barre de progression
function demarrerDecompte(niveauActuel) {
  if (intervalID) {
    clearInterval(intervalID);
  }

  const intervalTemps = calculerInterval(niveauActuel);
  const id = setInterval(function () {
    setProgression(function (ancienneValeur) {
      const nouvelleValeur = ancienneValeur - 1;

      if (nouvelleValeur <= 0) {
        clearInterval(id);
        setPartieTerminee(true);
        return 0;
      }

      if (nouvelleValeur >= 100) {
        clearInterval(id);
        const nouveauNiveau = niveauActuel + 1;
        setNiveau(nouveauNiveau);
        setTimeout(function () {
          setProgression(50);
          demarrerDecompte(nouveauNiveau);
        }, 1000);
        return 100;
      }

      return nouvelleValeur;
    });
  }, intervalTemps);

  setIntervalID(id);
}

// Trouve les alignements horizontaux dans la grille
function trouverAlignementHorizontal(grilleActuelle = grille) {
  const alignements = [];

  for (let ligne = 0; ligne < taille; ligne++) {
    for (let col = 0; col < taille - 2; col++) {
      const position = ligne * taille + col;
      const couleur = grilleActuelle[position];

      if (
        couleur &&
        couleur === grilleActuelle[position + 1] &&
        couleur === grilleActuelle[position + 2]
      ) {
        alignements.push(position);
        alignements.push(position + 1);
        alignements.push(position + 2);
      }
    }
  }

  return [...new Set(alignements)];
}

// Trouve les alignements verticaux dans la grille
function trouverAlignementVertical(grilleActuelle = grille) {
  const alignements = [];

  for (let col = 0; col < taille; col++) {
    for (let ligne = 0; ligne < taille - 2; ligne++) {
      const position = ligne * taille + col;
      const couleur = grilleActuelle[position];

      if (
        couleur &&
        couleur === grilleActuelle[position + taille] &&
        couleur === grilleActuelle[position + 2 * taille]
      ) {
        alignements.push(position);
        alignements.push(position + taille);
        alignements.push(position + 2 * taille);
      }
    }
  }

  return [...new Set(alignements)];
}

// Teste si un mouvement crée un alignement dans la grille
function mouvementCreeAlignement(grilleTeste, index1, index2) {
  const grilleTest = [...grilleTeste];

  const temp = grilleTest[index1];
  grilleTest[index1] = grilleTest[index2];
  grilleTest[index2] = temp;

  const alignementsH = trouverAlignementHorizontal(grilleTest);
  const alignementsV = trouverAlignementVertical(grilleTest);

  return alignementsH.length > 0 || alignementsV.length > 0;
}

// Remplit les cases vides avec de nouveaux bonbons
function faireTomberBonbons(nouvelleGrille) {
  for (let i = 0; i < nouvelleGrille.length; i++) {
    if (!nouvelleGrille[i]) {
      nouvelleGrille[i] =
        couleurs[Math.floor(Math.random() * couleurs.length)];
    }
  }

  return nouvelleGrille;
}

// Déplace un bonbon en fonction du mouvement de l'utilisateur
function deplacerBonbon(e, index) {
  if (partieTerminee) return;

  const diffX = e.nativeEvent.pageX - debutX;
  const diffY = e.nativeEvent.pageY - debutY;

  let positionCible = -1;

  if (Math.abs(diffX) > Math.abs(diffY)) {
    if (diffX < -50 && index % taille !== 0) {
      positionCible = index - 1;
    } else if (diffX > 50 && index % taille !== taille - 1) {
      positionCible = index + 1;
    }
  } else {
    if (diffY < -50 && index >= taille) {
      positionCible = index - taille;
    } else if (diffY > 50 && index < grille.length - taille) {
      positionCible = index + taille;
    }
  }

  if (positionCible !== -1) {
    if (mouvementCreeAlignement(grille, index, positionCible)) {
      const nouvelleGrille = [...grille];
      const temp = nouvelleGrille[index];
      nouvelleGrille[index] = nouvelleGrille[positionCible];
      nouvelleGrille[positionCible] = temp;

      setMouvementUtilisateur(true);
      setGrille(nouvelleGrille);
    }
  }
}

// Passe au niveau suivant et réinitialise la progression
function passerAuNiveauSuivant() {
  if (intervalID) {
    clearInterval(intervalID);
  }

  const nouveauNiveau = niveau + 1;
  setNiveau(nouveauNiveau);

  setTimeout(function() {
    setProgression(50);
    demarrerDecompte(nouveauNiveau);
  }, 100);
}

// Vérifie les alignements et met à jour la grille si nécessaire
function verifierEtMettreAJourGrille() {
  const alignementsH = trouverAlignementHorizontal();
  const alignementsV = trouverAlignementVertical();
  const tousAlignements = [...alignementsH, ...alignementsV];

  if (tousAlignements.length > 0) {
    const nouvelleGrille = [...grille];

    tousAlignements.forEach(function (position) {
      nouvelleGrille[position] = "";
    });

    const grilleFinale = faireTomberBonbons(nouvelleGrille);

    if (mouvementUtilisateur) {
      const pointsGagnes = tousAlignements.length * 10;
      setPoints(points + pointsGagnes);

      const augmentation = Math.min(tousAlignements.length * 2, 20);
      setProgression(function (prog) {
        const nouvelleProgression = prog + augmentation;

        if (nouvelleProgression >= 100) {
          setTimeout(function() {
            passerAuNiveauSuivant();
          }, 200);
          return 100;
        }

        return nouvelleProgression;
      });
    }

    setMouvementUtilisateur(false);
    setGrille(grilleFinale);
  }
}

// Nettoie l'intervalle lors du démontage du composant
useEffect(
  function () {
    return function () {
      if (intervalID) {
        clearInterval(intervalID);
      }
    };
  },
  [intervalID]
);

// Redémarre la partie en réinitialisant tous les paramètres
function redemarrerPartie() {
  if (intervalID) {
    clearInterval(intervalID);
  }
  initialiserJeu();
}

// Affiche la vitesse actuelle de décrément de la barre
function vitesseActuelle() {
  const facteur = calculerFacteurVitesse(niveau);
  return `Vitesse: x${facteur.toFixed(1)}`;
}

  // Rendu du composant
  return (
    <ImageBackground source={require("../assets/fond.jpg")} style={styles.fond}>
    <View style={styles.conteneur}>
      <View >
        <Text style={styles.titre}>Bienvenu {username} !</Text>
      </View>
      {/* Affichage des infos */}
      <View style={styles.infoContainer}>
        <Text style={styles.texteInfo}>Points: {points}</Text>
        <Text style={styles.texteInfo}>Niveau: {niveau}</Text>
        <Text style={styles.texteInfo}>Meilleur score : {meilleurScore}</Text>
      </View>

      {/* Barre de progression */}
      <View style={styles.barreContainer}>
        <View style={styles.barreFond}>
          <View
            style={[styles.barreProgression, { width: `${progression}%` }]}
          />
        </View>
        <View style={styles.progressInfoContainer}>
          <Text>{Math.floor(progression)}%</Text>
          <Text>{vitesseActuelle()}</Text>
        </View>
      </View>

      {/* Grille de jeu */}
      <View style={styles.grille}>
        {grille.map(function (couleur, index) {
          return (
            <TouchableOpacity
              key={index}
              style={[styles.case, { width: `${100 / taille}%` }]}
              onPressIn={function (e) {
                setDebutX(e.nativeEvent.pageX);
                setDebutY(e.nativeEvent.pageY);
              }}
              onPressOut={function (e) {
                deplacerBonbon(e, index);
              }}
              disabled={partieTerminee}
            >
<Image source={images[couleur]} style={styles.bonbon} />
</TouchableOpacity>
          );
        })}
      </View>

      {/* Écran de fin de partie */}
      {partieTerminee && (
        <View style={styles.finPartie}>
          <Text style={styles.texteFinPartie}>Partie terminée!</Text>
          <Text style={styles.texteScore}>Score final: {points}</Text>
          <Text style={styles.texteNiveau}>Niveau atteint: {niveau}</Text>
          <TouchableOpacity
            style={styles.boutonRestart}
            onPress={() => {
              redemarrerPartie();
              joueurMeilleurScore(points);
            }}
          >
            <Text style={styles.texteBouton}>Redémarrer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.boutonRestart}
            onPress={() => {
            navigation.navigate("meilleurs_scores", { username , meilleurScore })
            }}
          >
            <Text style={styles.texteBouton}>Meilleurs scores</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </ImageBackground>
  );
}

// Styles
const styles = StyleSheet.create({
  fond: {
    flex: 1, 
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },

  conteneur: {
    flex: 1, 
    alignItems: "center",
    justifyContent: "space-between", 
    paddingVertical: 20,
  },

  titre: {
    fontSize: 30,
    textAlign: "center",
    marginTop: 60, 
    fontWeight: "bold",
    color: "white",
   
  },

  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
  },

  texteInfo: {
    fontSize: 20,
    color: "white",
  },

  barreContainer: {
    width: "80%",
    marginBottom: 20,
  },

  barreFond: {
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },

  barreProgression: {
    height: "100%",
    backgroundColor: "green",
  },

  progressInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  grille: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", 
    alignItems: "center", 
    width: "90%",
    height: "60%", 
  },

  case: {
    aspectRatio: 1,
    padding: 2,
  },

  bonbon: {
    width: 55, 
    height: 55, 
    resizeMode: "contain", 
  },

  finPartie: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  texteFinPartie: {
    fontSize: 30,
    color: "white",
    marginBottom: 10,
  },

  texteScore: {
    fontSize: 22,
    color: "white",
    marginBottom: 5,
  },

  texteNiveau: {
    fontSize: 22,
    color: "white",
    marginBottom: 20,
  },

  boutonRestart: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15
  },

  texteBouton: {
    color: "white",
    fontSize: 18,
  },
});

export default CandyCrush;
