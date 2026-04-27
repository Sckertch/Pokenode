const express = require('express');
const {body, validationResult } = require('express-validator');
const Pokemon = require("./models/pokemon");
const buildMongo = require("./core/utils");
const app = express();
const pokemonAllowedFields = ["name", "description", "types", "image"];
const typeAllowedFields = ["name"];
const myReponse = require("./core/apiResponse");
const Type = require("./models/type");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    console.log(
        "method: ",
        req.method,
        " url:",
        req.url,
        " user-agent:",
        req.get("User-Agent"),
    );
    next();
})



app.get("/", (req, res) => {
    res.send("Acceuil des pokémons")
});

app.get("/pokemon", (req, res) => {
    Pokemon.find({}, "name image")
        .then((pokemons) => {
        res.json(myReponse(res.statusCode,"Pokémons trouvés :", pokemons));
    })
});

app.get("/pokemon/:_id", (req, res) => {

    Pokemon.findOne({_id: req.params._id})
        .select("-__v ")
        .populate("types", "name -_id")
        .then((pokemon) => {
                console.log(pokemon);
                res.json(myReponse(res.statusCode, "Pokemon trouvé :", pokemon))
            }
        )
});



app.post(
    "/pokemon",
    body('name')
        .isLength({ min: 1 })
        .withMessage("Pokemons name must be at least 1 character"),
    body('types')
        .isArray({ min: 1 })
        .withMessage("Pokemons must be at least 1 type"),
    body('types')
        .isArray({ max: 2 })
        .withMessage("Pokemons cannot have more than 2 types"),
    async (req, res) => {
        console.log("Let's create a new pokemon");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors);
        }

        const typeNames = req.body.types; // ex: ["Plante", "Poison"]
        const foundTypes = await Type.find({ name: { $in: typeNames } });

        if (foundTypes.length !== typeNames.length) {
            return res.status(422).json({ errors: [{ msg: "Un ou plusieurs types sont invalides" }] });
        }

        const typeIds = foundTypes.map(t => t._id);

        const pokemonData = buildMongo(req.body, pokemonAllowedFields);
        pokemonData.types = typeIds; // ✅ on remplace les strings par les ObjectIds

        await Pokemon.create(pokemonData);

        await Pokemon.find({ name: req.body.name })
            .populate('types', "-__v")
            .select("-__v")
            .then(() =>
                res.json(myReponse(res.statusCode, "Pokemon créé :", pokemonData))
        );
    },
);



app.patch("/pokemon/:_id",
    body('name')
        .optional({ checkFalsy: true })
        .isLength({ min: 1 })
        .withMessage("Pokemon name must be at least 1 character"),
    body('types')
        .optional()
        .isArray({ min: 1 })
        .withMessage("Pokemons must be at least 1 type"),
    body('types')
        .optional()
        .isArray({ max: 2 })
        .withMessage("Pokemons cannot have more than 2 types"),
    async (req, res) => {
        console.log("Let's edit a pokemon");

        const errors = validationResult(req);


        if (!errors.isEmpty()) {
            console.error(errors);
            console.log('res.body: ',req.body)
            return res.status(422).json(errors);
        }

        let typeIds = [];
        if (Array.isArray(req.body.types)){

            let typeNames = req.body.types; // ex: ["Plante", "Poison"]
            if (typeNames[0] === typeNames[1]){
                console.log('typeName',typeNames[0]);
                typeNames = Array(typeNames[0])
            }

            const foundTypes = await Type.find({ name: { $in: typeNames } });

            console.log('found type',foundTypes);
            console.log('req body type',typeNames);
            if (foundTypes.length !== typeNames.length) {
                return res.status(422).json(myReponse(res.statusCode, errors,errors));
            }

            typeIds = foundTypes.map(t => t._id);
        }


        const pokemonData = buildMongo(req.body, pokemonAllowedFields);

        if (typeIds.length > 0) pokemonData.types = typeIds;


        console.log('pokemonData:', pokemonData);

       await Pokemon.findOneAndUpdate(
           { _id: req.params._id },
           pokemonData
       ).populate('types', "-__v")
           .select("-__v")
           .then(() =>
               res.json(myReponse(res.statusCode, "Pokémon modifié :",pokemonData))
           );
    },
);


app.delete("/pokemon/:_id", async (req, res) => {
    console.log("Let's delete a pokemon");

    await Pokemon.findOneAndDelete({ _id: req.params._id })
        .populate('types', "-__v")
        .select("-__v")
        .then((pokemon) =>
            res.json(myReponse(res.statusCode, "Pokémon supprimé avec succes",pokemon)));
})

app.get("/type", async (req, res) => {
    console.log("Let's get a types");
    Type.find().then((types) => {
        res.json(myReponse(res.statusCode, "Liste des types :",types));
    })
})

app.post(
    "/type",
    body('name')
        .isLength({ min: 1 })
        .withMessage("Type must be at least 1 character"),
    async (req, res) => {
        console.log("Let's create a new type");

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors);
        }

        await Type.create(buildMongo(req.body,typeAllowedFields));

        await Type.find({ name: req.body.name }).then((type) =>
            res.json(myReponse(res.statusCode, "Type créé :", type))
        );
    },
);


app.delete("/type/:_id", async (req, res) => {
    console.log("Let's delete a type");

    await Type.findOneAndDelete({ _id: req.params._id })
        .populate('types', "-__v")
        .select("-__v")
        .then((type) =>
            res.json(myReponse(res.statusCode, "Pokémon supprimé avec succes",type)));
})

app.use((req, res) => {
    res.status(404).send("Page non trouvée");
});

module.exports = app;
