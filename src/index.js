import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class BikeRentalApp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            availableBikes: [],
            rentedBikes: []
        }
    }

    async  componentDidMount() {
        try {
            const allBikesJSON = await fetch('http://localhost:3001')
            const allBikes = await allBikesJSON.json()
            const availableBikes = allBikes.available,
                rentedBikes = allBikes.rented

            this.setState({
                availableBikes: availableBikes,
                rentedBikes: rentedBikes
            })
        } catch (e) {
            console.log(e)
        }
    };

    handleAddBike = async (bike) => {
        try {
            const availableBikes = this.state.availableBikes.slice()
            const newBikeJSON = await fetch('http://localhost:3001/add', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bike)
            });
            const newBike = await newBikeJSON.json()

            availableBikes.push(newBike)
            this.setState({
                ...this.state,
                availableBikes: availableBikes
            })
        } catch (e) {
            console.log(e)
        }
    }

    handleRent = async (e) => {
        try {
            const bikeId = e.target.getAttribute('bike-id')
            const availableBikes = this.state.availableBikes.slice()
            const rentedBikes = this.state.rentedBikes.slice()
            const rentedBikeIndex = availableBikes.findIndex(el => el._id === bikeId)

            const rentedBikeJSON = await fetch(`http://localhost:3001/rent?id=${bikeId}`, {
                method: 'PUT'
            })
            const rentedBike = await rentedBikeJSON.json()
            availableBikes.splice(rentedBikeIndex, 1)
            rentedBikes.push(rentedBike)

            this.setState({
                availableBikes: availableBikes,
                rentedBikes: rentedBikes
            })


        } catch (e) {
            console.log(e)
        }

    }

    handleDelete = async (e) => {
        try {
            const bikeId = e.target.getAttribute('bike-id')
            const availableBikesJSON = await fetch(`http://localhost:3001/delete?id=${bikeId}`, {
                method: 'DELETE'
            })
            const availableBikes = await availableBikesJSON.json()


            this.setState({
                ...this.state,
                availableBikes: availableBikes
            })
        } catch (e) {
            console.log(e)
        }
    }

    handleCancelRent = async (e) => {
        try {
            const bikeId = e.target.getAttribute('bike-id')
            const availableBikes = this.state.availableBikes.slice()
            const rentedBikes = this.state.rentedBikes.slice()
            const unrentedBikeIndex = rentedBikes.findIndex(el => el._id === bikeId)

            const unrentedBikeJSON = await fetch(`http://localhost:3001/cancel_rent?id=${bikeId}`, {
                method: 'PUT'
            })
            const unrentedBike = await unrentedBikeJSON.json()
            rentedBikes.splice(unrentedBikeIndex, 1)
            availableBikes.push(unrentedBike)

            this.setState({
                ...this.state,
                availableBikes: availableBikes,
                rentedBikes: rentedBikes
            })
        } catch (e) {
            console.log(e)
        }
    }

    render() {
        return (
            <div className='container'>
                <div className='bike-rental-app'>
                    <h1>Awesome bike rental</h1>
                    <AddBike onAddBike={this.handleAddBike} />
                    <RentedBikes
                        bikes={this.state.rentedBikes}
                        onCancelRent={this.handleCancelRent}
                    />
                    <AvailableBikes
                        bikes={this.state.availableBikes}
                        onRent={this.handleRent}
                        onDelete={this.handleDelete} />
                </div>
            </div>
        )
    }
}

class AddBike extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            bikeName: '',
            bikeTypes: ['Custom', 'Mountain', 'Road'],
            selectedType: 'Custom',
            bikePrice: ''
        }
    }

    handleChangeName = (e) => {
        this.setState({ ...this.state, bikeName: e.target.value })
    }

    handleChangeType = (e) => {
        this.setState({ ...this.state, selectedType: e.target.value })
    }

    handleChangePrice = (e) => {
        this.setState({
            ...this.state,
            bikePrice: e.target.value
        })
    }

    handleSubmit = (e) => {
        e.preventDefault()
        const newBike = {
            name: this.state.bikeName,
            type: this.state.selectedType,
            price: this.state.bikePrice,
            isRented: false
        }
        this.props.onAddBike(newBike)
        this.setState({
            ...this.state,
            bikeName: '',
            bikePrice: ''
        })
    }

    render() {
        const types = this.state.bikeTypes.map((el, i) =>
            <option value={el} key={i}>{el}</option>);

        return (
            <div>
                <h2>Add new bike</h2>
                <form
                    className='add-bike-form add-bike-block'
                    onSubmit={this.handleSubmit}>
                    <label className='add-bike-label name-input'>
                        Bike name:
                        <input
                            className='add-bike-input'
                            required
                            type="text"
                            value={this.state.bikeName}
                            onChange={this.handleChangeName}
                        />
                    </label>
                    <label className='add-bike-label'>
                        Bike type:
                        <select
                            className='add-bike-input type-select'
                            onChange={this.handleChangeType}
                            >
                            {types}
                        </select>
                    </label>
                    <label className='add-bike-label price-input'>
                        Rent Price:
                        <input
                            className='add-bike-input'
                            required
                            type="number"
                            value={this.state.bikePrice}
                            onChange={this.handleChangePrice}
                        />
                    </label>
                    <button
                        className="btn add-bike-btn"
                        type="submit"
                    >
                        Add Bike
                    </button>
                </form>
            </div>
        )
    }
}

function AvailableBikes(props) {
    const bikes = props.bikes
    const bikesItems = bikes.map((el) =>
        <div
            className="bikes-block" key={el._id}>
            <span>{el.name} / {el.type} / ${el.price}</span>
            <div>
                <button
                    className="btn rent-btn"
                    onClick={props.onRent}
                    bike-id={el._id}>Rent</button>
                <button
                    className="btn cancel-delete-btn"
                    onClick={props.onDelete}
                    bike-id={el._id}>Delete</button>
            </div>
        </div>)

    return (
        <div>
            <h2>Available bikes (Total: {props.bikes.length})</h2>
            <div>
                {bikesItems}
            </div>
        </div>
    )
}


function RentedBikes(props) {
    const bikes = props.bikes
    const totalPrice = bikes.reduce((acc, el) => acc += el.currentPrice, 0)
    const bikesItems = bikes.map(el =>
        <div key={el._id} className="bikes-block">
            <div className='rented-info'>
                <span>{el.name} / {el.type} / ${el.currentPrice}</span>
                <small>In rent for {el.rentedHours} hour(s), price for hour: ${el.price}</small>
            </div>

            <button
                className="btn cancel-delete-btn"
                onClick={props.onCancelRent}
                bike-id={el._id}>
                Cancel Rent
                </button>
        </div>)

    return (
        <div>
            <h2>Rented bikes (Total: {props.bikes.length}, ${totalPrice})</h2>
            {bikesItems}
            <small>If rent time is over 20 hours, price decreases in half</small>
        </div>
    )
}

ReactDOM.render(
    <BikeRentalApp />,
    document.getElementById('root')
);