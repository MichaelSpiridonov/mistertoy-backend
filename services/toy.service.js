
import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    query,
    getById,
    remove,
    save
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    var toysToReturn = toys
    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        toysToReturn = toysToReturn.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.price) {
        toysToReturn = toysToReturn.filter(toy => toy.price >= filterBy.price)
    }

    if (filterBy.inStock !== 'All') {
        toysToReturn = toysToReturn.filter(toy => {
            Boolean(filterBy.inStock).valueOf() === toy.inStock
        })
    }

    if (filterBy.labels) {
        const labelsToFilter = filterBy.labels
        toysToReturn = toysToReturn.filter(toy =>
            labelsToFilter.every(label => toy.labels.includes(label))
        )
    }

    if (filterBy.sort) {
        if (filterBy.sort === 'name') {
            toysToReturn = toysToReturn.sort((a, b) => a.name.localeCompare(b.name));
        } else if (filterBy.sort === 'price') {
            toysToReturn = toysToReturn.sort((a, b) => a.price - b.price);
        } else if (filterBy.sort === 'createdAt') {
            toysToReturn = toysToReturn.sort((a, b) => a.createdAt - b.createdAt);
        }
    }
    return Promise.resolve(toysToReturn)
}

function getById(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        toyToUpdate.vendor = toy.vendor
        toyToUpdate.speed = toy.speed
        toyToUpdate.price = toy.price
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toys.push(toy)
    }
    
    return _saveToysToFile().then(() => toy)
}


function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, (err) => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}
