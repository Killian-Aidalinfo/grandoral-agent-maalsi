import { AsyncLocalStorage } from "async_hooks";

/**
 * Classe Store
 * 
 * Une classe permettant de gérer un stockage local asynchrone
 * grâce à la librairie `AsyncLocalStorage`. Cette classe fournit
 * des méthodes pour définir et récupérer des données dans un contexte
 * asynchrone unique, sans collision entre différents appels asynchrones.
 */
class Store {
    /**
     * Constructeur de la classe Store
     * 
     * Initialise une instance d'AsyncLocalStorage pour gérer
     * un contexte asynchrone unique.
     */
    asyncLocalStorage
    constructor() {
        this.asyncLocalStorage = new AsyncLocalStorage();
    }

    /**
     * Vérifie et initialise un contexte asynchrone si aucun n'existe.
     * 
     * Cette méthode garantit qu'un contexte est toujours disponible
     * pour stocker des données. Si aucun contexte n'est présent,
     * un nouveau contexte vide est créé.
     */
    ensureContext() {
        if (!this.asyncLocalStorage.getStore()) {
            this.asyncLocalStorage.enterWith({});
        }
    }

    /**
     * Définit une clé et une valeur dans le contexte asynchrone.
     * 
     * @param {string} key - La clé sous laquelle la valeur sera stockée.
     * @param {*} value - La valeur à stocker dans le contexte.
     * 
     * Exemple :
     * ```javascript
     * store.set("userId", 123);
     * ```
     */
    set(key, value) {
        this.ensureContext();
        const store = this.asyncLocalStorage.getStore();
        store[key] = value;
    }

    /**
     * Récupère une valeur depuis le contexte asynchrone.
     * 
     * @param {string} [key] - La clé de la valeur à récupérer. Si aucune clé n'est fournie,
     *                         la méthode retourne l'intégralité du contexte.
     * @returns {*} - La valeur associée à la clé spécifiée, ou l'intégralité
     *                du contexte si aucune clé n'est fournie.
     * 
     * Exemple :
     * ```javascript
     * const userId = store.get("userId");
     * const entireContext = store.get();
     * ```
     */
    get(key) {
        this.ensureContext();
        const store = this.asyncLocalStorage.getStore();
        if (key) {
            return store[key];
        }
        return store;
    }
}

export const store = new Store();