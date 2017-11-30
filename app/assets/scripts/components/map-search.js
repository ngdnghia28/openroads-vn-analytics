'use strict';
import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { t, getLanguage } from '../utils/i18n';
import {
  setSearchType,
  fetchFieldVProMMsIds,
  fetchVProMMsBbox,
  setFilteredVProMMs,
  fetchAdmins,
  clearAdmins,
  fetchAdminBbox
} from '../actions/action-creators';

var MapSearch = React.createClass({
  displayName: 'MapSearch',

  propTypes: {
    searchType: React.PropTypes.string,
    fetching: React.PropTypes.bool,
    vpromms: React.PropTypes.array,
    admins: React.PropTypes.array,
    filteredVProMMs: React.PropTypes.array,
    lang: React.PropTypes.string,
    _setSearchType: React.PropTypes.func,
    _fetchAdmins: React.PropTypes.func,
    _clearAdmins: React.PropTypes.func,
    _setFilteredVProMMs: React.PropTypes.func,
    _fetchVProMMsBbox: React.PropTypes.func,
    _fetchFieldVProMMsIds: React.PropTypes.func,
    _fetchAdminBbox: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      searchVal: '',
      showResults: true
    };
  },

  componentDidMount: function () {
    this.props._fetchFieldVProMMsIds();
    this.search = _.debounce(this.search, 300);
  },

  componentWillUnmount: function () {
    this.props._clearAdmins();
    this.props._setFilteredVProMMs([]);
  },

  componentWillReceiveProps: function (nextProps) {
    if (this.props.lang !== nextProps.lang) {
      this.setState({ searchVal: '', showResults: false });
      this.props._clearAdmins();
      this.props._setFilteredVProMMs([]);
    }
  },

  onClearSearch: function (e) {
    this.setState({ searchVal: '', showResults: false });
    this.props._clearAdmins();
    this.props._setFilteredVProMMs([]);
  },

  onSearchTypeChange: function (e) {
    this.props._setSearchType(e.target.value);
    this.setState({ searchVal: '', showResults: true });
    this.props._clearAdmins();
    this.props._setFilteredVProMMs([]);
  },

  onSearchQueryChange: function (e) {
    var searchVal = _.trim(e.target.value);
    this.setState({ searchVal, showResults: true });
    // The search function is debounced.
    this.search(searchVal);
  },

  onSearchSubmit: function (e) {
    e.preventDefault();
    this.setState({ showResults: true });
    // On enter, use the first value. Feeling lucky!
    var searchVal = this.state.searchVal;
    if (searchVal.length) {
      if (this.props.searchType === 'Admin' && this.props.admins[0]) {
        this.searchAdminArea(this.props.admins[0].id);
        this.setState({ searchVal: this.props.admins[0].name_en });
      } else if (this.props.filteredVProMMs[0]) {
        this.searchVProMMsID(this.props.filteredVProMMs[0]);
        this.setState({ searchVal: this.props.filteredVProMMs[0] });
      }
    }
  },

  search: function (searchVal) {
    if (this.props.searchType === 'Admin') {
      if (searchVal.length > 0) {
        this.props._fetchAdmins(searchVal);
      } else {
        this.props._clearAdmins();
      }
    } else {
      if (searchVal.length >= 2) {
        // Filter the available vpromms.
        const matches = this.props.vpromms.filter((vpromm) => {
          return vpromm.slice(0, searchVal.length) === searchVal.toUpperCase();
        });
        this.props._setFilteredVProMMs(matches.slice(0, 10));
      } else {
        this.props._setFilteredVProMMs([]);
      }
    }
  },

  searchVProMMsID: function (VProMMsID) {
    this.setState({ showResults: false }, () => {
      // Wait for the state to be set, otherwise the shouldComponentUpdate
      // of the parent will prevent the re-render.
      // This is an artifact.
      this.props._fetchVProMMsBbox(VProMMsID);
    });
  },

  searchAdminArea: function (adminAreaID) {
    this.setState({ showResults: false }, () => {
      // Wait for the state to be set, otherwise the shouldComponentUpdate
      // of the parent will prevent the re-render.
      // This is an artifact.
      this.props._fetchAdminBbox(adminAreaID);
    });
  },

  onAAClick: function (aa, e) {
    e.preventDefault();
    this.searchAdminArea(aa.id);
    this.setState({ searchVal: getLanguage() === 'en' ? aa.name_en : aa.name_vn });
  },

  onVprommClick: function (id, e) {
    e.preventDefault();
    this.searchVProMMsID(id);
    this.setState({ searchVal: id });
  },

  renderResults: function () {
    if (!this.state.showResults) {
      return null;
    }

    if (this.props.fetching) {
      return (
        <div className='search-results'>
          <p className='info'>{t('Loading')}...</p>
        </div>
      );
    }

    // Data to work with depends n the search type.
    let data = this.props.searchType === 'Admin' ? this.props.admins : this.props.filteredVProMMs;
    let contents = null;

    if (this.props.searchType === 'Admin') {
      if (data.length) {
        contents = _(data)
          .groupBy(o => o.level)
          .reduce((acc, level, key) => {
            acc.push(<h4 key={`aa-type-admin-${key}`}>{t('Admin Level')} - {key}</h4>);

            let adminAreas = level.reduce((_acc, o) => {
              return _acc.concat(<li key={o.id}><a href='#' onClick={this.onAAClick.bind(null, o)}>{getLanguage() === 'en' ? o.name_en : o.name_vn}</a></li>);
            }, []);

            acc.push(<ul key={`aa-admins-${key}`}>{adminAreas}</ul>);

            return acc;
          }, []);
      } else {
        if (this.state.searchVal) {
          contents = <p className='info' key='no-results'>{t('No results available. Please refine your search')}</p>;
        }
      }
    } else if (this.props.searchType === 'VProMMs' && this.state.searchVal.length >= 2) {
      if (!data.length) {
        contents = <p className='info' key='no-results'>{t('No results available. Please refine your search')}</p>;
      } else {
        contents = [<h4 key={`vpromms-title`}>VProMMs</h4>];

        let vpromms = data.reduce((acc, o, key) => {
          return acc.concat(<li key={o}><a href='#' onClick={this.onVprommClick.bind(null, o)}>{o}</a></li>);
        }, []);

        contents.push(<ul key={`vpromms-list`}>{vpromms}</ul>);
      }
    }

    if (contents === null) {
      return null;
    }

    return (
      <div className='search-results'>
        <div className='inner'>
          {contents}
        </div>
      </div>
    );
  },

  render: function () {
    return (
      <form className='form search' onSubmit={this.onSearchSubmit}>
        <div className='form__group'>
          <label className='form__label' htmlFor='search-field'>{t('Search')}</label>
          <div className='form__input-group form__input-group--medium'>
            <select className='form__control' onChange={this.onSearchTypeChange} value={this.props.searchType}>
              <option value='Admin'>{t('Admin')}</option>
              <option value='VProMMs'>VProMMs</option>
            </select>
            <input
              type='text'
              id='search-field'
              name='search-field'
              className='form__control'
              placeholder={t('Search')}
              value={this.state.searchVal}
              onChange={this.onSearchQueryChange} />
            <button type='button' className='search__button' title={t('Search')} onClick={this.onSearchSubmit}><span>{t('Search')}</span></button>
          </div>
          {this.state.searchVal !== '' && <button type='button' className='search__clear' title={t('Clear search')} onClick={this.onClearSearch}><span>{t('Clear search')}</span></button> }
          {this.renderResults()}
        </div>
      </form>
    );
  }
});

function selector (state) {
  return {
    searchType: state.setSearchType.searchType,
    admins: state.admins.units,
    vpromms: state.fieldVProMMsids.ids,
    filteredVProMMs: state.setFilteredVProMMs,
    fetching: state.VProMMSids.fetching || state.admins.fetching,
    lang: state.language.current
  };
}

function dispatcher (dispatch) {
  return {
    _fetchFieldVProMMsIds: (...args) => dispatch(fetchFieldVProMMsIds(...args)),
    _setSearchType: (...args) => dispatch(setSearchType(...args)),
    _setFilteredVProMMs: (filteredVProMMs) => dispatch(setFilteredVProMMs(filteredVProMMs)),
    _clearAdmins: () => dispatch(clearAdmins()),
    _fetchAdmins: (id) => dispatch(fetchAdmins(id)),
    _fetchVProMMsBbox: (vprommsId) => dispatch(fetchVProMMsBbox(vprommsId)),
    _fetchAdminBbox: (id) => dispatch(fetchAdminBbox(id))
  };
}

module.exports = connect(selector, dispatcher)(MapSearch);