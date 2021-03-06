import React, { Component, PropTypes } from 'react';
import { browserHistory } from 'react-router'
import export_table_to_excel from './Table2Excel.js'


import { createContainer } from 'meteor/react-meteor-data';

import { ApiCars } from '/imports/api/cars.js';
import { ApiLines } from '/imports/api/lines.js';

import CarRow from './CarRow.js';
import HeadList from './HeadList.js';

import { map, debounce, find, filter } from 'lodash';


class CarsReport extends Component {
  constructor(props, context) {
    super(props, context); 

    this.state = {
      selectedCarsID: [],
      foundItems: [],
      searchField: '',
      currentPage: 1,
      itemsOnPage: 10,
      electedAll: false
    }

    this.handleSelect = this.handleSelect.bind(this);
    this.handleSelectAll = this.handleSelectAll.bind(this);
    this.handleChangeSearchField = debounce(this.handleChangeSearchField.bind(this), 350);
    this.removeCars = this.removeCars.bind(this);
    this.addCar = this.addCar.bind(this);
    this.onReportCars = this.onReportCars.bind(this);
    this.pageUp = this.pageUp.bind(this);
    this.pageDown = this.pageDown.bind(this);
    this.handleCarSingleOnClick = this.handleCarSingleOnClick.bind(this);

    context.router
  }
  

  componentWillReceiveProps(props) {    
    if (this.props.cars != props.cars) {
      this.handleChangeSearchField(this.state.searchField, props);
    }
  }

  componentWillUpdate(nextProps, nextState){
    const lastPage = Math.ceil(nextState.foundItems.length / this.state.itemsOnPage);

    if(nextState.foundItems.length && this.state.currentPage > lastPage)
      this.setState({currentPage: lastPage});
  }


  componentDidMount(){
    this.setState({foundItems: this.props.cars});
  }


  addCar() {
    const _id = new Mongo.ObjectID();
    ApiCars.insert({ _id, maintenance: [] });
    browserHistory.push(`/managePanel/cars/new${_id}`);
  }


  removeCars() {
    this.state.selectedCarsID.map((carID) => {
      ApiCars.remove(new Mongo.ObjectID(carID));
    })

    this.setState({selectedCarsID: []});
  }

  onReportCars(){
    export_table_to_excel('tableToExcel');
  }


  handleSelectAll(){
    const { selectedCarsID, itemsOnPage, foundItems, selectedAll } = this.state;
    let newSelectedCarsID = [];

    if (!selectedAll) {
      foundItems.map((itemCar, key) => {
          if((key >= (this.state.currentPage-1) * this.state.itemsOnPage) && 
             (key <   this.state.currentPage    * this.state.itemsOnPage)){

            if (!newSelectedCarsID.includes(itemCar._id._str)) {
              newSelectedCarsID.push(itemCar._id._str);
            }
          }
      });
    }

    this.selectAll.checked = !selectedAll;
    
    this.setState({selectedCarsID: newSelectedCarsID, selectedAll: !selectedAll});
  }


  handleSelect(e, Car){
    let newSelectedCarsID = this.state.selectedCarsID;
    const CarID = ""+Car._id;
    const index = newSelectedCarsID.indexOf(CarID);
    let currentSelectedAll = this.state.selectedAll;

    if (index === -1 ) 
      newSelectedCarsID.push(CarID);
    else 
      newSelectedCarsID.splice(index, 1);

    if (currentSelectedAll || !newSelectedCarsID.length) {
      currentSelectedAll = false;
      this.selectAll.checked = currentSelectedAll;
    }

    

    this.setState({selectedCarsID: newSelectedCarsID, electedAll: currentSelectedAll});
  }


  handleChangeSearchField(queryText = this.state.searchField, props = this.props){
    const searchQuery = queryText.toLowerCase();

    var displayedCars = props.cars.filter(function(el) {
        const carName        = el.name ? el.name.toLowerCase() : '';
        const carPlateNumber = el.plateNumber ? el.plateNumber.toLowerCase() : '';
        const carStatus      = el.status ? el.status.toLowerCase() : '';
        const carTotalExpense      = el.totalExpense ? el.totalExpense.toLowerCase() : '';
        const carTotalIncome      = el.totalIncome ? el.totalIncome.toLowerCase() : '';
        const carProfit      = el.profit ? el.profit.toLowerCase() : '';

        return (carName.includes(searchQuery)         || 
                carPlateNumber.includes(searchQuery)  || 
                carStatus.includes(searchQuery)       ||
                carTotalExpense.includes(searchQuery) ||
                carTotalIncome.includes(searchQuery)  ||
                carProfit.includes(searchQuery))
    });


    this.setState({
      searchField: queryText,
      foundItems: displayedCars
    })
  }


  pageUp(){
    this.setState({currentPage: this.state.currentPage + 1 });
  }

  pageDown(){
    this.setState({currentPage: this.state.currentPage - 1 });
  }


  handleCarSingleOnClick(carId) {
    browserHistory.push(`/managePanel/cars/${carId}`)
    // this.context.router.push(`/cars/${carId}`)
  }


  render() {

    const renderCars = () => {
      return this.state.foundItems.map((itemCar, key) => {
        if(   (key >= (this.state.currentPage-1) * this.state.itemsOnPage) 
           && (key <   this.state.currentPage    * this.state.itemsOnPage))

          return <CarRow 
                    key={key} 
                    car={itemCar} 
                    carLines={ filter(this.props.lines, {car: itemCar._id}) }
                    onClick={this.handleCarSingleOnClick.bind(null, itemCar._id)}
                    selectedCarsId={this.state.selectedCarsID} 
                    onHandleSelect={this.handleSelect} />
        }
      )
    }


    const renderCarsForPrint = () => {
      return (
        <table id="tableToExcel" className="hide">
          <tbody>
            <tr>
              <td>Name</td>
              <td>Plate number</td>
              <td>Status</td>
              <td>Expenses</td>
              <td>Income</td>
              <td>Profit</td>
            </tr>
           { 
              this.state.selectedCarsID.map((el, key) => {
                const currentCar = find(this.props.cars, {_id: new Mongo.ObjectID(el)});
          
                totalExpense = 0;
                totalIncome = 0;
  
                if (currentCar.maintenance) {
                  currentCar.maintenance.map((el) => {
                    const amount = !isNaN(parseInt(el.amount)) ? parseInt(el.amount) : 0;
                    totalExpense += amount;
                  })
                }
  

                this.props.lines.map((lineEl) => {
                  if (lineEl.car && lineEl.car._str == currentCar._id._str) {
                    const amount = !isNaN(parseInt(lineEl.amount)) ? parseInt(lineEl.amount) : 0;
                    totalIncome += amount;
                  }
                })


                console.log('currentCar.name', currentCar.name);


                return (
                  <tr key={`tr-${key}`}>
                    <td>{ currentCar.name ? currentCar.name+'' : '' }</td>
                    <td>{ currentCar.plateNumber ? currentCar.plateNumber+'' : '' }</td>
                    <td>{ currentCar.status ? currentCar.status+'' : '' }</td>
                    <td>{ totalExpense }</td>
                    <td>{ totalIncome }</td>
                    <td>{ totalIncome - totalExpense }</td>
                  </tr>
                )
              })
           }
          </tbody>
        </table>)
    }

    return (
      <div>

        <HeadList
          currentPage={this.state.currentPage}
          itemsOnPage={this.state.itemsOnPage}
          numbSelected={this.state.selectedCarsID.length}
          totalItems={this.state.foundItems.length}
          pageUp={this.pageUp}
          pageDown={this.pageDown}
          onChangeSearchField={this.handleChangeSearchField}
          onAddNew={this.addCar} 
          onRemoveCars={this.removeCars}
          onReportCars={this.onReportCars}
          isReport={true} />

        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>
                <input type="checkbox" 
                       ref={(ref) => this.selectAll = ref}
                       onChange={this.handleSelectAll} />
              </th>
              <th>Name</th>
              <th>Plate number</th>
              <th>Status</th>
              <th>Expenses</th>
              <th>Income</th>
              <th>Profit</th>
            </tr>
          </thead>

          <tbody>
           { renderCars() }
          </tbody>
        </table>

        { renderCarsForPrint() } 
      </div>
    )
  }
}

CarsReport.propTypes = {
  cars: PropTypes.array.isRequired,
};

CarsReport.contextTypes = {
    router: React.PropTypes.object.isRequired
}


export default createContainer(() => {
  Meteor.subscribe('cars');
  Meteor.subscribe('lines');

  return {
    cars: ApiCars.find().fetch(),
    lines: ApiLines.find().fetch()
  };
}, CarsReport);