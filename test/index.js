import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
import provisionGitIgnore from '../src/';
describe('provisionGitIgnore', () => {

  it('is a function', () => {
    provisionGitIgnore.should.be.a('function');
  });

  it('returns an object with .gitignore property', () => {
    provisionGitIgnore().should.be.an('object').that.has.keys([ '.gitignore' ]);
  });

  describe('.gitignore gitignore', () => {
    let gitignore = null;
    beforeEach(() => {
      gitignore = provisionGitIgnore()['.gitignore'];
    });

    it('has right keys', () => {
      gitignore.should.have.keys([ 'questions', 'contents' ]);
    });

    describe('gitIgnoreTemplates question', () => {
      let question = null;
      beforeEach(() => {
        question = gitignore.questions[0];
      });

      it('has the right properties', () => {
        question.should.have.keys([ 'type', 'name', 'message', 'choices', 'when' ]);
      });

      it('includes choices from ignores.json file', () => {
        question.choices.should.deep.contain.members([
          { name: 'test', value: 'test' },
          { name: 'the', value: 'the' },
        ]);
      });

    });

  });

});
