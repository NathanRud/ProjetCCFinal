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

  // Fonction pour calculer le facteur de vitesse en fonction du niveau
  function calculerFacteurVitesse(niveauActuel) {
    let facteur = 10;
    for (let i = 1; i < niveauActuel; i++) {
      facteur += 0.7;
    }
    return facteur;
  }

  function joueurMeilleurScore(points) {
    if(points > meilleurScore){
      setMeilleurScore(points);
    }
  }

  // Fonction pour calculer l'intervalle de temps en millisecondes
  function calculerInterval(niveauActuel) {
    const facteur = calculerFacteurVitesse(niveauActuel);
    return 3000 / facteur;
  }

  // Fonction pour démarrer le décompte de la barre de progression
  function demarrerDecompte(niveauActuel) {
    // Arrêter l'ancien intervalle s'il existe
    if (intervalID) {
      clearInterval(intervalID);
    }

    // Calculer l'intervalle en fonction du niveau
    const intervalTemps = calculerInterval(niveauActuel);

    console.log(
      `Niveau ${niveauActuel}: décrément toutes les ${intervalTemps}ms`
    );

    // Créer un nouvel intervalle
    const id = setInterval(function () {
      setProgression(function (ancienneValeur) {
        // Décrémenter de 1% à chaque intervalle
        const nouvelleValeur = ancienneValeur - 1;

        // Vérifier si c'est la fin de la partie
        if (nouvelleValeur <= 0) {
          clearInterval(id);
          setPartieTerminee(true);
          return 0;
        }

        // Vérifier si on passe au niveau suivant
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

  // Fonction pour trouver les alignements horizontaux
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

    // Enlever les doublons
    return [...new Set(alignements)];
  }

  // Fonction pour trouver les alignements verticaux
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

    // Enlever les doublons
    return [...new Set(alignements)];
  }

  // TEst si alignement
  function mouvementCreeAlignement(grilleTeste, index1, index2) {
    const grilleTest = [...grilleTeste];

    const temp = grilleTest[index1];
    grilleTest[index1] = grilleTest[index2];
    grilleTest[index2] = temp;


    const alignementsH = trouverAlignementHorizontal(grilleTest);
    const alignementsV = trouverAlignementVertical(grilleTest);

    
    return alignementsH.length > 0 || alignementsV.length > 0;
  }

  // régénerer bonbon
  function faireTomberBonbons(nouvelleGrille) {
   
    for (let i = 0; i < nouvelleGrille.length; i++) {
      if (!nouvelleGrille[i]) {
        nouvelleGrille[i] =
          couleurs[Math.floor(Math.random() * couleurs.length)];
      }
    }

    return nouvelleGrille;
  }

  // Fonction pour gérer le déplacement d'un bonbon
  function deplacerBonbon(e, index) {
    if (partieTerminee) return;

    // Calculer la différence entre le point de départ et d'arrivée
    const diffX = e.nativeEvent.pageX - debutX;
    const diffY = e.nativeEvent.pageY - debutY;

    // Position cible (l'index du bonbon avec lequel on veut échanger)
    let positionCible = -1;

    // Déterminer la direction du mouvement
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Mouvement horizontal
      if (diffX < -50 && index % taille !== 0) {
        // Gauche (si on n'est pas sur le bord gauche)
        positionCible = index - 1;
      } else if (diffX > 50 && index % taille !== taille - 1) {
        // Droite (si on n'est pas sur le bord droit)
        positionCible = index + 1;
      }
    } else {
      // Mouvement vertical
      if (diffY < -50 && index >= taille) {
        // Haut (si on n'est pas sur le bord supérieur)
        positionCible = index - taille;
      } else if (diffY > 50 && index < grille.length - taille) {
        // Bas (si on n'est pas sur le bord inférieur)
        positionCible = index + taille;
      }
    }

    // Si on a une position cible valide
    if (positionCible !== -1) {
      // Vérifier si le mouvement crée un alignement
      if (mouvementCreeAlignement(grille, index, positionCible)) {
        // Créer une copie de la grille
        const nouvelleGrille = [...grille];

        // Échanger les deux bonbons
        const temp = nouvelleGrille[index];
        nouvelleGrille[index] = nouvelleGrille[positionCible];
        nouvelleGrille[positionCible] = temp;

        // Mettre à jour l'état
        setMouvementUtilisateur(true);
        setGrille(nouvelleGrille);
      }
    }
  }

  // Fonction pour passer au niveau suivant
  function passerAuNiveauSuivant() {
    // Arrêter l'intervalle actuel
    if (intervalID) {
      clearInterval(intervalID);
    }
    
    // Passer au niveau suivant
    const nouveauNiveau = niveau + 1;
    setNiveau(nouveauNiveau);
    
    // Réinitialiser et démarrer nouveau décompte après un court délai
    setTimeout(function() {
      setProgression(50);
      demarrerDecompte(nouveauNiveau);
    }, 100);
  }

  // Fonction pour vérifier et mettre à jour la grille
  function verifierEtMettreAJourGrille() {
    // Trouver les alignements
    const alignementsH = trouverAlignementHorizontal();
    const alignementsV = trouverAlignementVertical();
    const tousAlignements = [...alignementsH, ...alignementsV];

    // S'il y a des alignements
    if (tousAlignements.length > 0) {
      // Créer une copie de la grille
      const nouvelleGrille = [...grille];

      // Supprimer les bonbons alignés
      tousAlignements.forEach(function (position) {
        nouvelleGrille[position] = "";
      });

      // Faire tomber les bonbons et ajouter des nouveaux
      const grilleFinale = faireTomberBonbons(nouvelleGrille);

      // Si c'est un mouvement de l'utilisateur, ajouter des points
      if (mouvementUtilisateur) {
        // Nombre de points gagnés
        const pointsGagnes = tousAlignements.length * 10;
        setPoints(points + pointsGagnes);

        // Augmenter
        const augmentation = Math.min(tousAlignements.length * 2, 20);
        setProgression(function (prog) {
          const nouvelleProgression = prog + augmentation;

          // Passer nv suivant 
          if (nouvelleProgression >= 100) {
            setTimeout(function() {
              passerAuNiveauSuivant();
            }, 200);
            return 100;
          }

          return nouvelleProgression;
        });
      }

      // Réinitialiser le mouvement utilisateur
      setMouvementUtilisateur(false);

      // Mettre à jour la grille
      setGrille(grilleFinale);
    }
  }

  // Vérifier les alignements après chaque mise à jour de la grille
  useEffect(
    function () {
      verifierEtMettreAJourGrille();
    },
    [grille]
  );

  // Nettoyer l'intervalle quand le composant est démonté
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

  // Fonction pour redémarrer la partie
  function redemarrerPartie() {
    if (intervalID) {
      clearInterval(intervalID);
    }
    initialiserJeu();
  }

  // Fonction pour afficher la vitesse de décrément
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
    flex: 1, // Prend toute la hauteur de l'écran
    resizeMode: "cover", // Ajuste l'image de fond
    justifyContent: "center",
    alignItems: "center",
  },

  conteneur: {
    flex: 1, // Permet d'occuper tout l'espace disponible
    alignItems: "center",
    justifyContent: "space-between", // Espace entre titre et grille
    paddingVertical: 20,
  },

  titre: {
    fontSize: 30,
    textAlign: "center",
    marginTop: 60, // Décale le titre vers le haut
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
    justifyContent: "center", // Centre horizontalement
    alignItems: "center", // Centre verticalement
    width: "90%", // Ajuste la largeur
    height: "60%", // Ajuste la hauteur pour bien centrer la grille
  },

  case: {
    aspectRatio: 1,
    padding: 2,
  },

  bonbon: {
    width: 55, // Largeur de l'image
    height: 55, // Hauteur de l'image
    resizeMode: "contain", // Ajuste l'image sans la déformer
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
  },

  texteBouton: {
    color: "white",
    fontSize: 18,
  },
});

export default CandyCrush;