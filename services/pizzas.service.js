let pizzasCollection;
exports.registerMongoClient = (_client) => {
    pizzasCollection = _client.db('pizza-app').collection('pizzas');
};

exports.getAll = async (req, res) => {
    try {
        let { search, tags, page } = req.query;
        const pageSize = 6;
        console.log('tags', tags);
        if (tags && tags.length) {
            tags = JSON.parse(tags);
        }
        page = parseInt(page) || 1;
        let filterQuery = {};
        if (search && search.length) {
            filterQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { ingredients: { $regex: search, $options: 'i' } },
                ],
            };
        }
        if (tags && tags.length) {
            filterQuery.tags = { $all: tags };
        } 
        if (page){
            page = parseInt(page);
        }


        console.log('filterQuery', filterQuery);
        const pizzas = await pizzasCollection
            .find(filterQuery)
            .skip((page-1)*pageSize)
            .limit(pageSize)
            .toArray();
        return res.json(pizzas);
    } catch (e) {
        console.error(e);
        res.sendStatus(400);
    }
};

exports.getOne = async (req, res) => {
    const id = req.params.id;
    try {
        const pizza = await pizzasCollection.findOne({_id: id});
        res.json(pizza);
    } catch (e) {
        console.error(e);
    }
};

exports.insertOne = async (req, res) => {
    const pizza = req.body;
    try {
        await pizzasCollection.insertOne(pizza);
        // res.end({message: 'Success on writing pizza', data: JSON.stringify(pizza)});
        res.end();
    } catch (e) {
        console.error(e);
        if (e.code === 11000) {
            res.send({message: 'Pizza with that ID already exists'});
        }
        res.sendStatus(400);
    }
};

exports.deleteOne = async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pizzasCollection.deleteOne({_id: id});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

exports.updateOne = async (req, res) => {
    const id = req.params.id;
    const newPizza = req.body;
    try {
        const result = await pizzasCollection.findOneAndUpdate({_id: id}, {$set: newPizza});
        res.json(result);
    } catch (e) {
        console.error(e);
    }
};

