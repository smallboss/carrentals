import React, { Component, PropTypes } from 'react';
import { clone, map, reverse, cloneDeep, find } from 'lodash';
import { createContainer } from 'meteor/react-meteor-data'

import { ApiPayments } from '/imports/api/payments.js';
import { ApiInvoices } from '/imports/api/invoices.js';
import TableHeadButtons from './TableHeadButtons.js';
import PaymentTabRow from './PaymentTabRow.js';

export default class PaymentsOnTab extends Component {
    constructor(props) {
        super(props); 

        this.state = {
            selectedListId: [],
            isEdit: false
        }

        this.changeSelectedItem = this.changeSelectedItem.bind(this);
        this.handleAddNewPayment = this.handleAddNewPayment.bind(this);
        this.handleEditPayments = this.handleEditPayments.bind(this);
        this.handleRemovePayments = this.handleRemovePayments.bind(this);
        this.handleSavePayment = this.handleSavePayment.bind(this);
    }   


    changeSelectedItem(itemId) {
        let selectedListId = this.state.selectedListId;
        let index = -1;

        map(selectedListId, (item, key) => {
            if (item._str == itemId._str) {
                index = key;
            }
        })


        if (index === -1) selectedListId.push(itemId) 
        else selectedListId.splice(index, 1);

        let isEdit = this.state.isEdit;
        isEdit = !selectedListId.length ? false : isEdit;

        this.setState({selectedListId, isEdit});
    }

// ====================== ADD = EDIT = REMOVE = SAVE ======================
    handleAddNewPayment(){
        const paymentId = new Mongo.ObjectID();
        ApiPayments.insert({_id: paymentId, customerId: this.props.invoice.customerId});
        ApiInvoices.update(this.props.invoice._id, {$push: { paymentsId: paymentId }});

        let selectedListId = this.state.selectedListId;
        selectedListId.push(paymentId)

        this.setState({ selectedListId, isEdit: true });
    }

    handleEditPayments(){
        this.setState({isEdit: !this.state.isEdit})
    }

    handleRemovePayments(){
        const invoice = this.props.invoice;
        
        map(this.state.selectedListId, (itemId, index) => {
            invoice.paymentsId.splice(invoice.paymentsId.indexOf(itemId), 1);
            ApiInvoices.update({_id: invoice._id}, {$pull: {paymentsId: itemId}})
            ApiPayments.remove(itemId);
        })

        this.setState({selectedListId: []});
    }

    handleSavePayment(payment){
        const _id = clone(payment._id);
        delete payment._id;

        ApiPayments.update(_id, {$set: payment });

        let selectedListId = this.state.selectedListId;
        selectedListId.splice(selectedListId.indexOf(_id), 1);

        this.setState({ selectedListId });
    }
// END =================== ADD = EDIT = REMOVE = SAVE ======================

    render(){
        // let paymentListId = this.props.invoice.paymentsId;
        let paymentListId = reverse(this.props.paymentsId);

        const RenderTableHeadButtons = () => {
            if (!this.props.readOnly) {
                return (
                    <TableHeadButtons 
                        selectedItems={this.state.selectedListId.length}
                        onAddNew={this.handleAddNewPayment}
                        onEdit={this.handleEditPayments}
                        onRemove={this.handleRemovePayments}/>
                )
            }

            return null;
        }


        return(
            <div>
                { RenderTableHeadButtons() }

                <table className="table table-bordered table-hover">
                    <thead>
                        <tr>
                            { !this.props.readOnly ? (<th><input type="checkbox" disabled/></th>) : null }
                            <th>Payment ID</th>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {(() => {
                            if (paymentListId) {
                                return (
                                    reverse(paymentListId).map((item, key) => {
                                        return (
                                            <PaymentTabRow key={`payment-${key}`}
                                                onSelect={this.changeSelectedItem.bind(null,item)}
                                                payment={clone(ApiPayments.findOne({_id: item}))}
                                                onSave={this.handleSavePayment}
                                                selectedListId={this.state.selectedListId}
                                                isEdit={this.state.isEdit}
                                                readOnly={this.props.readOnly}/>
                                        )
                                }))
                            }
                            return undefined
                        })()}
                    </tbody>
                </table>
            </div>
        )
    }
}

PaymentsOnTab.propTypes = {
  payments: PropTypes.array.isRequired,
};

PaymentsOnTab.contextTypes = {
  router: React.PropTypes.object.isRequired
}


export default createContainer(() => {
  Meteor.subscribe('payments');

  return {
    payments: ApiPayments.find().fetch()
  };
}, PaymentsOnTab);