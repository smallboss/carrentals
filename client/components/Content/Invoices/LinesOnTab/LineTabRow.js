import React, { Component, PropTypes } from 'react';
import DatePicker from 'react-bootstrap-date-picker'
import { Link } from 'react-router';
import { map, find, clonem, cloneDeep } from 'lodash';

export default class LineTabRow extends Component {
    constructor(props) {
        super(props); 

        this.state = {
            dispLine: cloneDeep(this.props.line),
            isEdit: false
        }

        this.onChangeCarName= this.onChangeCarName.bind(this);
        this.onChangeAmount = this.onChangeAmount.bind(this);
        this.onChangeDateFrom = this.onChangeDateFrom.bind(this);
        this.onChangeDateTo = this.onChangeDateTo.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
    } 


    componentWillReceiveProps(nextProps){
        let dispLine = cloneDeep(nextProps.line);

        const nextLine = nextProps.line ? nextProps.line._id._str : '';
        const isSelected = find(nextProps.selectedListId, {_str: nextLine});
        if (this.checkbox)
            this.checkbox.checked = isSelected;

        const isEdit = (isSelected && nextProps.isEdit) ? true : false;

        this.setState({dispLine, isEdit});
    }


    componentDidMount() {
        let dispLine = cloneDeep(this.props.line);

        const nextLine =  this.props.line ? this.props.line._id._str : '';
        const isSelected = find( this.props.selectedListId, {_str: nextLine});

        if (this.checkbox)
            this.checkbox.checked = isSelected;

        const isEdit = (isSelected &&  this.props.isEdit) ? true : false;

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
        newLine.dateFrom = value.slice(0, 10);
        this.setState({dispLine: newLine});
    }
    onChangeDateTo(value){
        let newLine = this.state.dispLine;
        newLine.dateTo = value.slice(0, 10);
        this.setState({dispLine: newLine});
    }
    onChangeAmount(value){
        let newLine = this.state.dispLine;
        value = (value!='' && isNaN(parseInt(value))) ? '0' : value;
        let isDepr = false;

        isDepr = ((parseInt(value) < 0) || 
                  (value.includes('e')) || 
                  (value.includes('E')) ||
                  (value.length >= 10));

        value = isNaN(parseInt(value)) ? '0' : parseInt(value)+'';

        newLine.amount = isDepr ?  newLine.amount : value;
        this.setState({dispLine: newLine});
    }


// END ================ CHANGERS FIELDS =============================

    render(){
        let line = this.props.line ? this.props.line : {};
        let dispLine = this.state.dispLine;
        const cars = this.props.cars ? this.props.cars : [];
        const car = find(cars, {_id: line.car});

        const showItem = () => {
            if (this.state.isEdit){
                return(
                    <select className=' form-control' onChange={(e) => this.onChangeCarName(e.target.value)}>
                          {(() => {
                            if (car) {
                                return (    
                                  <option
                                    value={ car._id }>{ car.name }
                                  </option>
                                )
                            } else {
                                return ( 
                                    <option
                                        value={ '' }>{ '' }
                                    </option>
                                )
                            }

                          })()}
                          {
                            cars.map((el, key) => {
                                const carHelp = car ? car : {}
                                if (el._id != carHelp._id) {
                                  return (
                                    <option 
                                      key={`car-${key}`} 
                                      value={el._id._str}>{el.name}</option>
                                  )
                                }
                                return undefined;
                              }
                            )}
                        </select>
                )
            }

            return <span>{car ? car.name : ''}</span>
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
                    <DatePicker value={dispLine.date}
                                onChange={this.onChangeDate}/>
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
                    <DatePicker value={dispLine.dateFrom}
                                onChange={ this.onChangeDateFrom } />
                )
            }

            return <span>{line ? line.dateFrom : ''}</span>
        }
        const showDateTo = () => {
            if (this.state.isEdit){
                return(
                    <DatePicker value={dispLine.dateTo}
                                onChange={ this.onChangeDateTo } />
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
                    <input  type="number"
                            min="0"
                            max="99999"
                            value={this.state.dispLine.amount}
                            onChange={(e) => this.onChangeAmount(e.target.value)} />
                )
            }

            return <span>{(line && line.amount) ? line.amount : '0'}</span>
        }


        const renderCheckBoxAndSave = () => {
            if (!this.props.readOnly) {
                
                if (!this.state.isEdit){
                    return (
                        <th className="noPrint">
                            <input  type="checkbox" 
                                    onChange={() => this.props.onSelect(line._id)}
                                    ref={(ref) => this.checkbox = ref} />
                        </th>
                    )
                } else {
                    return (
                        <th className="noPrint">
                            <button
                                onClick={ () =>  this.props.onSave(this.state.dispLine) }
                                className='btn btn-danger'>
                                Save
                            </button>
                        </th>
                    )
                }
            } 

            return null;
        }


        return(
            <tr className="LineTabRow">
                { renderCheckBoxAndSave() }
                <td>
                    {/* buttonSave()*/ }
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