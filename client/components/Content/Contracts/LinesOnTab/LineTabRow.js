import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { map, find } from 'lodash';

export default class LineTabRow extends Component {
    constructor(props) {
        super(props); 

        this.state = {
            dispLine: this.props.line,
            isEdit: this.props.isEdit
        }


        this.onChangeCarName= this.onChangeCarName.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);

    } 


    componentWillReceiveProps(nextProps){
        let dispLine = (!this.state.dispLine)
                                    ? nextProps.line 
                                    : this.state.dispLine

        const nextLine = nextProps.line ? nextProps.line._id._str : '';
        const isSelected = find(nextProps.selectedListId, {_str: nextLine});
        
        if (this.checkbox)
            this.checkbox.checked = isSelected;

        const isEdit = (isSelected && nextProps.isEdit) ? true : false;

        this.setState({dispLine, isEdit});
    }

// ==================== CHANGERS FIELDS =============================
    onChangeCarName(value){
        let newLine = this.state.dispLine;
        newLine.car = new Mongo.ObjectID(value);
        this.setState({dispLine: newLine});
    }
    onChangeDescription(value){
        let newLine = this.state.dispLine;
        newLine.description = value;
        this.setState({dispLine: newLine});
    }
    onChangeDateFrom(value){
        let newLine = this.state.dispLine;
        newLine.dateFrom = value.splice(0, 10);
        this.setState({dispLine: newLine});
    }
    onChangeDateTo(value){
        let newLine = this.state.dispLine;
        newLine.dateTo = value.splice(0, 10);
        this.setState({dispLine: newLine});
    }
    onChangeAmount(value){
        let newLine = this.state.dispLine;
        newLine.amount = value;
        this.setState({dispLine: newLine});
    }
// END ================ CHANGERS FIELDS =============================


    render(){
        let line = this.props.line ? this.props.line : {};
        let dispLine = this.state.dispLine;
        const cars = this.props.cars ? this.props.cars : [];
        const car = find(cars, {_id: line.car});

        const buttonSave = () => {
            if (this.state.isEdit) {
                return (
                    <button
                        onClick={() => this.props.onSave(this.state.dispLine)}
                        className='btn btn-danger'>
                        Save
                    </button>
                )
            }

            return undefined;
        }

        const showItem = () => {
            return <Link to={`/managePanel/invoices/${this.props.invId._str}`}>
                        {this.props.codeName}
                   </Link>
        }

        const showDescription = () => {
            if (this.state.isEdit) {
                return (
                    <input type="text"
                           className="form-control "
                           onChange={(e) => this.onChangeDescription(e.target.value)}
                           value={ dispLine.description } />
                )
            }

            return <span>{line ? line.description : ''}</span>
        }

        const showDate = () => {
            if (this.state.isEdit){
                return(
                    <input  type="date"
                            value={dispLine.date}
                            onChange={(e) => this.onChangeDate(e.target.value)} />
                )
            }

            return <span>{line ? line.date : ''}</span>
        }
        const showCarPlate = () => {
            let carIdStr = line.car ? line.car._str : '';

            return (
                <Link to={`/managePanel/cars/${carIdStr}`}>
                    <span>{(line && car) 
                            ? car.plateNumber ? car.plateNumber : 'car profile'
                            : ''}
                    </span>
                </Link>
            )
        }
        const showDateFrom = () => {
            if (this.state.isEdit){
                return(
                    <input  type="date"
                            value={dispLine.dateFrom}
                            onChange={(e) => this.onChangeDateFrom(e.target.value)} />
                )
            }

            return <span>{line ? line.dateFrom : ''}</span>
        }
        const showDateTo = () => {
            if (this.state.isEdit){
                return(
                    <input  type="date"
                            value={dispLine.dateTo}
                            onChange={(e) => this.onChangeDateTo(e.target.value)} />
                )
            }

            return <span>{line ? line.dateTo : ''}</span>
        }
        const showPeriod = () => {
            let period;
            let Date1, Date2;

            if (this.state.isEdit){
                Date1 = new Date (dispLine.dateFrom);
                Date2 = new Date (dispLine.dateTo);
            } else {
                Date1 = new Date (line.dateFrom);
                Date2 = new Date (line.dateTo);
            }

            period = Math.floor((Date2.getTime() - Date1.getTime())/(1000*60*60*24));

            return <span>{(line && period) ? period : ''}</span>
        }
        const showAmount = () => {
            if (this.state.isEdit){
                return(
                    <input  type="text"
                            value={dispLine.amount}
                            onChange={(e) => this.onChangeAmount(e.target.value)} />
                )
            }

            return <span>{line ? line.amount : ''}</span>
        }


        return(
            <tr className="LineTabRow">
                {(() => {
                    if (!this.props.readOnly) {
                        <th>
                            <input  type="checkbox" 
                                onChange={() => this.props.onSelect(line._id)}
                                ref={(ref) => this.checkbox = ref}/>
                        </th>
                    }
                    return null;
                })()}
                <td>
                    { buttonSave() }
                    { showItem() }
                </td>
                <td>{ showDescription() }</td>
                <td>{ showCarPlate() }</td>
                <td>{ showDateFrom() }</td>
                <td>{ showDateTo() }</td>
                <td>{ showPeriod() }</td>
                <td>{ showAmount() }</td>
            </tr>
        )
    }
}