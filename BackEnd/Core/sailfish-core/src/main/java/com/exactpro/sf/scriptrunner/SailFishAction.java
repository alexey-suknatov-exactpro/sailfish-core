/******************************************************************************
 * Copyright 2009-2018 Exactpro (Exactpro Systems Limited)
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
package com.exactpro.sf.scriptrunner;

import java.util.List;
import java.util.Objects;

import org.apache.commons.lang3.ArrayUtils;
import org.apache.commons.lang3.StringUtils;

import com.exactpro.sf.aml.script.MetaContainer;

/**
 * Parent class for AML 3 TActions classes
 * @author nikita.smirnov
 */
public class SailFishAction {

    /**
     * Create MetaContainer for AML 2 action 
     */
    protected static MetaContainer createMetaContainer(MetaContainer parent, String name, String failUnexpected, String doublePrecision, String systemPrecision) {
        MetaContainer result = new MetaContainer();
        if (parent != null) {
            parent.add(name, result);
            if (failUnexpected == null) {
                failUnexpected = parent.getFailUnexpected();
            }
        }
        result.setFailUnexpected(failUnexpected);
        result.addDoublePrecision(doublePrecision);
        result.addSystemPrecision(systemPrecision);
        return result;
    }
    /**
     * Create MetaContainer for AML 2 action without parent
     */
    protected static MetaContainer createMetaContainer(String failUnexpected, String doublePrecision, String systemPrecision) {
        return createMetaContainer(null, null, failUnexpected, doublePrecision, systemPrecision);
    }
    /**
     * Create MetaContainer for AML 3 action 
     */
    protected static MetaContainer createMetaContainer(MetaContainer parent, String name, String failUnexpected) {
        return createMetaContainer(parent, name, failUnexpected, null, null);
    }
    /**
     * Create MetaContainer for AML 3 action without parent
     */
    protected static MetaContainer createMetaContainer(String failUnexpected) {
        return createMetaContainer(null, null, failUnexpected, null, null);
    }

    protected static MetaContainer createMetaContainerByPath(MetaContainer parent, String failUnexpected, String... path) {
        Objects.requireNonNull(parent, "parent cannot be null");

        if (StringUtils.isBlank(failUnexpected)) {
            throw new IllegalArgumentException("failUnexpected cannot be blank");
        }

        if (ArrayUtils.isEmpty(path)) {
            throw new IllegalArgumentException("path cannot be empty");
        }

        MetaContainer current = parent;

        for (int i = 0; i < path.length - 1; i++) {
            String field = path[i];
            List<MetaContainer> children = current.get(field);

            if (children == null) {
                MetaContainer child = new MetaContainer();
                current.add(field, child);
                current = child;
            } else {
                current = children.get(children.size() - 1);
            }
        }

        MetaContainer last = new MetaContainer();

        last.setFailUnexpected(failUnexpected);
        current.add(path[path.length - 1], last);

        return last;
    }
}
