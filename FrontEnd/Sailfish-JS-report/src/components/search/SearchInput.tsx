/******************************************************************************
 * Copyright 2009-2019 Exactpro (Exactpro Systems Limited)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/

import * as React from 'react';
import { connect } from 'react-redux';
import AppState from '../../state/models/AppState';
import { setSearchString } from '../../actions/actionCreators';

interface StateProps {
    searchString: string;
}

interface DispatchProps {
    updateSearchString: (searchString: string) => any;
}

interface Props extends StateProps, DispatchProps {}

const SearchInputBase = ({ searchString, updateSearchString }: Props) => (
    <div className="search-input">
        <input 
            type="text" 
            value={searchString} 
            onChange={e => updateSearchString(e.target.value)}/>
    </div>
)

const SearchInput = connect(
    (state: AppState): StateProps => ({
        searchString: state.filter.searchString
    }),
    (dispatch): DispatchProps => ({
        updateSearchString: searchString => dispatch(setSearchString(searchString))
    })
)(SearchInputBase);

export default SearchInput;
