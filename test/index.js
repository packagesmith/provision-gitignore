import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
import provisionGitignore from '../src/';
describe('provisionGitignore', () => {

  it('is a function', () => {
    provisionGitignore.should.be.a('function');
  });

  it('returns an object with .gitignore property', () => {
    provisionGitignore().should.be.an('object').that.has.keys([ '.gitignore' ]);
  });

  describe('.gitignore', () => {
    let gitignore = null;
    beforeEach(() => {
      gitignore = provisionGitignore()['.gitignore'];
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

      it('is not present when gitIgnoreTemplates option is supplied', () => {
        provisionGitignore({
          gitIgnoreTemplates: [ 'node' ],
        })['.gitignore'].should.have.property('questions').that.has.lengthOf(0);
      });

    });

    describe('contents function', () => {
      let gitignoreContents = null;
      beforeEach(() => {
        gitignoreContents = gitignore.contents;
      });

      it('preserves original file contents', () => {
        gitignoreContents('someline', { gitIgnoreTemplates: [ 'test' ] })
          .should.equal('this\nfile\nis\na\ntest\nstub\n');
      });

      it('appends any line from given additionalLines option', () => {
        provisionGitignore({
          additionalLines: [ 'foo', 'bar' ],
        })['.gitignore'].contents('someline', { gitIgnoreTemplates: [ 'test' ] })
          .should.equal('this\nfile\nis\na\ntest\nstub\nfoo\nbar\n');
      });

      it('can append multiple templates together', () => {
        provisionGitignore({
          additionalLines: [ 'foo', 'bar' ],
        })['.gitignore'].contents('someline', { gitIgnoreTemplates: [ 'test', 'the' ] })
          .should.equal('this\nfile\nis\na\ntest\nstub\nreal\ngenerated\nin\nlib/\nfoo\nbar\n');
        provisionGitignore({
          gitIgnoreTemplates: [ 'test', 'the' ],
          additionalLines: [ 'foo', 'bar' ],
        })['.gitignore'].contents('someline')
          .should.equal('this\nfile\nis\na\ntest\nstub\nreal\ngenerated\nin\nlib/\nfoo\nbar\n');
      });

      it('uses gitIgnoreTemplates option over answer', () => {
        provisionGitignore({
          gitIgnoreTemplates: [ 'test' ],
          additionalLines: [ 'foo', 'bar' ],
        })['.gitignore'].contents('someline', { gitIgnoreTemplates: [ 'test', 'the' ] })
          .should.equal('this\nfile\nis\na\ntest\nstub\nfoo\nbar\n');
      });

    });

  });

});
