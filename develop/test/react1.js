import chai from "chai"
import React from 'react'
import equalJSX from 'chai-equal-jsx'
import {createRenderer} from 'react-test-renderer/shallow'
import {Game} from '../src/client/components/Game';

chai.should()
chai.use(equalJSX)

describe('Fake react test', function(){
  it('works', function(){
    const renderer = createRenderer()
    renderer.render(React.createElement(Game))
    const output = renderer.getRenderOutput()
    output.should.equalJSX(<Board/>)
  })

})
