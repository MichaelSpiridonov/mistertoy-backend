
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
    if (filterBy.inStock) {
        toysToReturn = toysToReturn.filter(toy => toy.inStock === JSON.parse(filterBy.inStock))
    }
    if (filterBy.labels) {
        const labelsToFilter = filterBy.labels
        toysToReturn = toysToReturn.filter(toy =>
            labelsToFilter.every(label => toy.labels.includes(label))
        )
    }

    if (filterBy.sort.type) {
        toysToReturn.sort((toy1, toy2) => {
          const sortDirection = +filterBy.sort.desc
          if (filterBy.sort.type === 'name') {
            return toy1.name.localeCompare(toy2.name) * sortDirection
          } else if (filterBy.sort.type === 'price' || filterBy.sort.type === 'createdAt') {
            return (toy1[filterBy.sort.type] - toy2[filterBy.sort.type]) * sortDirection
          }
        })
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
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.inStock= toy.inStock
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toys.unshift(toy)
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
