const now = new Date()

module.exports = [
    {
        name: 'Super',
        type: 'Custom',
        price: 12,
        isRented: false
    },
    {
        name: 'Mega',
        type: 'Road',
        price: 13,
        isRented: false
    },
    {
        name: 'Crush',
        type: 'Mountain',
        price: 15,
        isRented: true,
        rentedTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    },
    {
        name: 'Pepsi',
        type: 'Road',
        price: '20',
        isRented: true,
        rentedTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 21, now.getMinutes(), now.getSeconds(), now.getMilliseconds())
    }
]

