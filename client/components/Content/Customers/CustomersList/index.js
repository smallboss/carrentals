/**
 * Created by watcher on 10/5/16.
 */
import { Meteor } from 'meteor/meteor'
import { createContainer } from 'meteor/react-meteor-data'
import React from 'react'
import { browserHistory } from 'react-router'
import { searcher } from '../../../../helpers/searcher'
import CustomerForTable from '../CustomerForTable'
import Pagination from '../Pagination'

class CustomersList extends React.Component {
    constructor(props, context) {
        super(props)
        this.state = {
            loginLevel: context.loginLevel,
            customers: this.props.customers,
            currentPage: 1,
            elemsOnPage: 10,
            maxPage: 0,
            stateForRemove: []            
        }
        this.handlerPagination = this.handlerPagination.bind(this)
        this.handlerDeleteCustomer = this.handlerDeleteCustomer.bind(this)
        this.handlerSearchCustomer = this.handlerSearchCustomer.bind(this)
    }
    componentWillMount () {
        let maxPage = Math.ceil(this.props.customers.length / this.state.elemsOnPage)
        this.setState({customers: this.props.customers, maxPage})
    }
    componentWillReceiveProps(nextProps, nextContext) {
        let _customers = nextProps.customers
        let maxPage = Math.ceil(_customers.length / this.state.elemsOnPage)
        let loginLevel = nextContext.loginLevel
        this.setState({customers: _customers, maxPage, loginLevel})
    }
    shouldComponentUpdate (nextProps, nextState) {
        let _check = (nextState.stateForRemove.length > 0 ) ? 0 : 1
        return _check
    }
    handlerPagination (num) {
        this.setState({currentPage: num})
    }
    handlerDeleteCustomer (e) {
        let arrForRemove = this.state.stateForRemove,
            { id, name } = e.target
        switch (name) {
            case 'checkbox-for-delete':
                if($(e.target).is(':checked')){
                    arrForRemove.push(id)
                } else {
                    arrForRemove = arrForRemove.filter(elem => {
                        if (elem != id) {
                            return elem
                        }
                    })
                }
                this.setState({stateForRemove: arrForRemove})
                break
            case 'remover-users':
                if(this.state.loginLevel !== 3) return false;
                arrForRemove.map(elem => {
                    Meteor.call('removeAllUserData', elem, (err) => {
                        if(err) {
                            console.log(err)
                        }
                    })
                })
                location.reload()                
                break
            default: break
        }
    }
    handlerSearchCustomer (e) {
        let searchValue = e.target.value.toLowerCase(),
            stateFromValue = [],
            _props = this.props.customers
        if(searchValue.length > 0) {
            let arrToFind = ['username', 'emails', 'profile.phone']
            stateFromValue = searcher(_props, arrToFind, searchValue)
        } else {
            stateFromValue = this.props.customers
        }
        let maxPage = Math.ceil(stateFromValue.length / this.state.elemsOnPage)
        this.setState({customers: stateFromValue, maxPage})
    }
    render () {        
        let currentNums = this.state.currentPage * this.state.elemsOnPage
        let _customers = this.state.customers.slice(currentNums - this.state.elemsOnPage, currentNums)
        return (
            <div>
                <h3>Customer`s list</h3>
                <div className='col-xs-9'></div>
                <div className='col-xs-3'>
                    <input type='search' className='form-control' placeholder='Search' onChange={this.handlerSearchCustomer} />
                </div>                
                <table className='table table-hover'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User name</th>
                            <th>Name</th>
                            <th>User email</th>                            
                            <th>User phone</th>                            
                        </tr>
                    </thead>
                    <tbody>
                        {_customers.map(customer => {
                            return (
                                <CustomerForTable customer_data={customer} handlerDeleteCustomer={this.handlerDeleteCustomer} key={Math.random()} />
                            )
                        })}
                    </tbody>
                </table>
                {(this.state.loginLevel === 3) ? <input type='button' className='btn btn-danger' name='remover-users' value='Delete users' onClick={this.handlerDeleteCustomer} /> : ''}
                <input type='button' className='btn btn-success m-x-1' name='add-user' value='Add user' onClick={() => {let _new = 'new'; browserHistory.push(`/managePanel/customer/${_new}`)}} />
                {(this.state.maxPage > 1) ? <div className='text-center'>
                    <Pagination num={this.state.maxPage} handlerPagination={this.handlerPagination} key={Math.random()} />
                </div> : ''}                
            </div>
        )
    }
}

CustomersList.contextTypes = {
    loginLevel: React.PropTypes.number.isRequired
}

export default createContainer(() => {
    Meteor.subscribe('users')
    return {
        customers: Meteor.users.find({'profile.userType': 'customer'}).fetch()
    }
}, CustomersList)