import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router'

import { createContainer } from 'meteor/react-meteor-data';
// import { ApiUserList } from '/imports/api/userList.js'
import { ApiPayments } from '/imports/api/payments.js';
import { ApiCustomers } from '/imports/api/customers';

import PaymentRow from './PaymentRow.js';
import HeadList from './HeadList.js';

import { map, debounce } from 'lodash';


class Payments extends Component {
  constructor(props, context) {
    super(props, context); 

    this.state = {
      selectedPaymentsID: [],
      foundItems: [],
      searchField: '',
      currentPage: 1,
      itemsOnPage: 10
    }

    this.handleSelect = this.handleSelect.bind(this);
    this.handleChangeSearchField = debounce(this.handleChangeSearchField.bind(this), 350);
    this.removePayments = this.removePayments.bind(this);
    this.addPayment = this.addPayment.bind(this);
    this.pageUp = this.pageUp.bind(this);
    this.pageDown = this.pageDown.bind(this);
    this.handlePaymentSingleOnClick = this.handlePaymentSingleOnClick.bind(this);

    context.router
  }


  componentWillReceiveProps(props) {    
    if (this.props.payments != props.payments) {
      this.handleChangeSearchField(this.state.searchField, props);
    }
  }

  componentWillUpdate(nextProps, nextState){
    const lastPage = Math.ceil(nextState.foundItems.length / this.state.itemsOnPage);

    if(nextState.foundItems.length && this.state.currentPage > lastPage)
      this.setState({currentPage: lastPage});
  }


  componentDidMount(){
    this.setState({foundItems: this.props.payments});
  }


  addPayment() {
    const _id = new Mongo.ObjectID();
    ApiPayments.insert({ _id});
    browserHistory.push(`/payments/new${_id}`);
  }


  removePayments() {
    this.state.selectedPaymentsID.map((paymentID) => {
      ApiPayments.remove(new Mongo.ObjectID(paymentID));
    })

    this.setState({selectedPaymentsID: []});
  }


  handleSelect(e, Payment){
    let newSelectedPaymentsID = this.state.selectedPaymentsID;
    const PaymentID = ""+Payment._id;
    const index = newSelectedPaymentsID.indexOf(PaymentID)


    if (index === -1 ) 
      newSelectedPaymentsID.push(PaymentID);
    else 
      newSelectedPaymentsID.splice(index, 1);
    

    this.setState({selectedPaymentsID: newSelectedPaymentsID});
  }


  handleChangeSearchField(queryText = this.state.searchField, props = this.props){
    const searchQuery = queryText.toLowerCase();

    var displayedPayments = props.payments.filter(function(el) {
        const paymenAmount = el.amount ? el.amount.toLowerCase()   : '';
        const paymenStatus = el.status ? el.status.toLowerCase()   : '';
        const paymenDate   = el.date   ? el.date.toLowerCase()     : '';
        const paymenID     = el._id    ? el._id._str.toLowerCase() : '';

        return (paymenAmount.indexOf(searchQuery) !== -1 ||
                paymenStatus.indexOf(searchQuery) !== -1 ||
                paymenDate.indexOf(searchQuery)   !== -1 ||
                paymenID.indexOf(searchQuery)     !== -1)
    });


    this.setState({
      searchField: queryText,
      foundItems: displayedPayments
    })
  }


  pageUp(){
    this.setState({currentPage: this.state.currentPage + 1 });
  }

  pageDown(){
    this.setState({currentPage: this.state.currentPage - 1 });
  }


  handlePaymentSingleOnClick(paymentId) {
    browserHistory.push(`/payments/${paymentId}`);
    // this.context.router.push(`/payments/${paymentId}`)
  }


  render() {

    const renderPayments = () => {
      return this.state.foundItems.map((itemPayment, key) => {
        if((key >= (this.state.currentPage-1) * this.state.itemsOnPage) && 
           (key <   this.state.currentPage    * this.state.itemsOnPage)) {

          return <PaymentRow 
                      key={key} 
                      item={itemPayment} 
                      customerName={Meteor.users.findOne(itemPayment.customerId)}
                      onClick={this.handlePaymentSingleOnClick.bind(null, itemPayment._id)}
                      selectedPaymentsId={this.state.selectedPaymentsID} 
                      onHandleSelect={this.handleSelect} />
          }
        }
      )
    }

    return (
      <div>
        <HeadList
          currentPage={this.state.currentPage}
          itemsOnPage={this.state.itemsOnPage}
          numbSelected={this.state.selectedPaymentsID.length}
          totalItems={this.state.foundItems.length}
          pageUp={this.pageUp}
          pageDown={this.pageDown}
          onChangeSearchField={this.handleChangeSearchField}
          onAddNew={this.addPayment} 
          onRemovePayments={this.removePayments} />

        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th><input type="checkbox" disabled="true"/></th>
              <th>Customer Name</th>
              <th>Date</th>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
           { renderPayments() }
          </tbody>
        </table>
      </div>
    )
  }
}

Payments.propTypes = {
  payments: PropTypes.array.isRequired,
};

Payments.contextTypes = {
  router: React.PropTypes.object.isRequired
}


export default createContainer(() => {
  Meteor.subscribe('payments');
  Meteor.subscribe('users')

  return {
    payments: ApiPayments.find().fetch(),
    userList: Meteor.users.find().fetch()
  };
}, Payments);