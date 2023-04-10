from copy import deepcopy
import sys

# adapted from https://medium.com/100-days-of-algorithms/day-94-earley-parser-3fffdb33edc7


class EarleyParser:
    def __init__(self, grammar):
        self.grammar = grammar
        self.states = []

    def parse(self, text):

        self.states = [set() for _ in range(len(text) + 1)]
        self.states[0].add(State(*grammar.start))

        print([(token,) for token in text + '\u0000'])

        for k, token in enumerate(text + '\u0000'):
            extension = list(self.states[k])
            self.states[k].clear()
            while extension:
                state = extension.pop()
                if state in self.states[k]:
                    continue

                self.states[k].add(state)
                if state.finished:
                    self._completer(state, extension)
                elif state.symbol in self.grammar.nonterminals:
                    self._predictor(state, k, extension)
                else:
                    self._scanner(state, k, token)
        self._print(text)

    def _predictor(self, state, origin, extension):
        for rule in self.grammar[state.symbol]:
            extension.append(State(*rule, origin=origin))

    def _scanner(self, state, origin, token):
        if isinstance(state.symbol, tuple) and state.symbol == (token,):
            self.states[origin + 1].add(state.shift)

    def _completer(self, state, extension):
        for test in self.states[state.origin] | set(extension):
            if state.nonterminal == test.symbol:
                extension.append(test.shift)

    def _print(self, text):
        print('\n')
        for k, state in enumerate(self.states):
            accepts = any(s.nonterminal == '^' and
                          s.finished for s in state)
            print('(%d)' % k, end=' ')
            print('"%s.%s"' % (text[:k], text[k:]), end=' ')
            print(accepts and 'ACCEPTS' or '')
            # for i in state:
            #     print('\t', i)

        state = self.states[-1]
        if any(s.nonterminal == '^' and s.finished for s in state):
            print(text, 'ACCEPTS')
        else:
            print(text, 'DOES NOT ACCEPT')


class State:
    def __init__(self, nonterminal, expression, dot=0, origin=0):
        self.nonterminal = nonterminal
        self.expression = expression

        self.dot = dot
        while(self.symbol == ('',)):
            self.dot += 1

        self.origin = origin

    @property
    def finished(self):
        return self.dot >= len(self.expression)

    @property
    def symbol(self):
        return None if self.finished else self.expression[self.dot]

    @property
    def shift(self):
        return State(self.nonterminal,
                     self.expression,
                     self.dot + 1,
                     self.origin)

    @property
    def tuple(self):
        return (self.nonterminal,
                self.expression,
                self.dot,
                self.origin)

    def __hash__(self):
        return hash(self.tuple)

    def __eq__(self, other):
        return self.tuple == other.tuple

    def __str__(self):
        n, e, d, o = self.tuple
        return '[%d] %s -> %s.%s' % (o, n, e[:d], e[d:])


class Grammar:
    def __init__(self, rules):
        unfiltered_rules = [(nonterminal, rule)
                            for nonterminal in rules for rule in rules[nonterminal]]
        self.nonterminals = list(rules.keys())

        self.rules = []

        while unfiltered_rules:
            for rule in deepcopy(unfiltered_rules):
                filtered = True
                for index, unfilt_sym in enumerate(rule[1]):
                    # need to create new rules for each element of the set
                    if isinstance(unfilt_sym, set):
                        filtered = False
                        for symbol in unfilt_sym:  # since it's a set it has more symbols in it
                            a = list(rule[1])
                            a[index] = symbol
                            unfiltered_rules.append((rule[0], tuple(a)))
                        break

                if filtered:
                    self.rules.append(rule)

                if rule in unfiltered_rules:
                    unfiltered_rules.remove(rule)

    @property
    def start(self):
        return next(self['^'])
        

    def __getitem__(self, nonterminal):
        yield from [
            rule
            for rule in self.rules
            if rule[0] == nonterminal
        ]


if __name__ == '__main__':
    grammar1 = Grammar({
        '^': [('expression',)],
        'expression': [('expression', ('\n',), 'expression',),
                       ('ws', 'fexp', 'ws',),
                       ('ws',)],
        'fexp': [('fexp', 'ws', (';',), 'ws', 'fexp',),
                 ('fexp', 'ws', (';',),),
                 ('fexp', 'ws', ('#',), 'text',),
                 #('function', 'ws', 'object',),
                 ('variable', 'ws', ('=',), 'ws', 'object',),
                 ({('',), 'object'}, 'ws', ('-',), ('>',), 'ws', 'object',),
                 ('key', 'ws', (':',), 'ws', 'object',),
                 ('object',)],
        'variable': [('object', ('.',), 'variable',), ('pvar',)],
        'pvar': [({(a,) for a in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'}, {('',), 'pvar'},)],
        'function': [({'argument', ('',)}, 'ws', 'fexp',)],
        'argument': [('variable',),
                     (('(',), 'ws', 'pargs', 'ws', (')',),)],
        'pargs': [('variable',),
                  ('variable', 'ws', (',',), 'ws', 'pargs',)],
        'object': [('variable',),
                   ('key',),
                   ('function',),
                   (('{',), 'ws', 'expression', 'ws', ('}',),),
                   # ('object', 'ws', ('[',), 'ws', 'key', 'ws', (']',),),
                   (('(',), 'ws', 'object', 'ws', (')',),)],
        'key': [('variable',),
                ('number',),
                ('boolean',),
                (('(',), 'ws', 'key', 'ws', (')',),),
                ('string',)],
        'number': [('variable',),
                   (('(',), 'ws', 'number', 'ws', (')',),),
                   ('number', 'ws', {('+',), ('-',),
                                     ('*',), ('/',)}, 'ws', 'number',),
                   ('number', 'ws', ('*',), ('*',), 'ws', 'number',),
                   ('int',),
                   ('decimal',)],
        'int': [('variable',),
                ('pnum',),
                ('number', 'ws', ('/',), ('/',), 'ws', 'int',),
                ('number', 'ws', ('%',), 'ws', 'int',),
                ('int', 'ws', ('+',), ('+',), 'ws', 'int',)],
        'decimal': [('variable',),
                    ('pnum', ('.',), 'pnum',)],
        'pnum': [({(a,) for a in '0123456789'}, {('',), 'pnum'},)],
        'boolean': [('variable',),
                    ('true',),
                    ('false',),
                    ('number', 'ws', {('>',), ('<',),
                                      ('>=',), ('<=',)}, 'ws', 'number',),
                    (('!',), 'ws', 'boolean',)],
        'string': [('variable',),
                   (('\'',), 'text', ('\'',),),
                   (('"',), 'text', ('"',),)],
        'text': [({(a,) for a in ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`-=~!@#$%^&*()_+[]\\;\',./{|}:"<>?'}, 'text',), (('',),)],
        'ws': [(('',),),
               ((' ',), 'ws',)]
    })
    grammar = Grammar({
        '^': [('expression',)],
        'expression': [('expression', ('\n',), 'expression',),
                       ('ws', 'fexp', 'ws',),
                       ('ws',)],
        'fexp': [('fexp', 'ws', (';',), 'ws', 'fexp'),
                 ('fexp', 'ws', (';',)),
                 ('fexp', 'ws', ('#',), 'text',),
                 ('variable', 'ws', ('=',), 'ws', 'object',),
                 ({('',), 'object'}, 'ws', ('-',), ('>',), 'ws', 'object',),
                 ('key', 'ws', (':',), 'ws', 'object',),
                 ('object',)],
        'variable': [('pvar',)],
        'pvar': [({(a,) for a in 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_'}, {('',), 'pvar'},)],
        'function': [({'argument', ('',)}, 'ws', 'object',)],
        'argument': [('variable',),
                     (('(',), 'ws', 'pargs', 'ws', (')',),)],
        'pargs': [('variable',),
                  ('variable', 'ws', (',',), 'ws', 'pargs',)],
        'object': [('variable',),
                   ('key',),
                   ('function',),
                   (('{',), 'ws', 'expression', 'ws', ('}',),),
                   (('(',), 'ws', 'object', 'ws', (')',),)],
        'number': [(('(',), 'ws', 'number', 'ws', (')',),),
                   ('number', 'ws', {('+',), ('-',),
                                     ('*',), ('/',)}, 'ws', 'number',),
                   ('number', 'ws', ('*',), ('*',), 'ws', 'number',),
                   ('int',),
                   ('decimal',)],
        'int': [('pnum',),
                ('number', 'ws', ('/',), ('/',), 'ws', 'int',),
                ('number', 'ws', ('%',), 'ws', 'int',),
                ('int', 'ws', ('+',), ('+',), 'ws', 'int',)],
        'decimal': [('pnum', ('.',), 'pnum',)],
        'pnum': [({(a,) for a in '0123456789'}, {('',), 'pnum'},)],
        'boolean': [('true',),
                    ('false',),
                    ('number', 'ws', {('>',), ('<',),
                                      ('>=',), ('<=',)}, 'ws', 'number',),
                    (('!',), 'ws', 'boolean',)],
        'string': [(('\'',), 'text', ('\'',),),
                   (('"',), 'text', ('"',),)],
        'text': [({(a,) for a in ' abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`-=~!@#$%^&*()_+[]\\;\',./{|}:"<>?'}, 'text',), (('',),)],
        'ws': [(('',),),
               ((' ',), 'ws',)]
    })
    f = open('example.bp').readlines()

    EarleyParser(grammar).parse(''.join(f))

    # EarleyParser(grammar).parse(''.join(sys.argv[1:]))

'''
expression -> expression (';'|'\n') expression
            | fexp
            | function object
fexp -> fexp ',' fexp
            | ?object '->' expression
            | variable '=' object
            | key ':' object
            | object
variable -> object '.' variable | (other shit)
function -> ?argument fexp
argument -> variable | '(' pargs ')'
pargs -> variable | variable ',' pargs
object -> key
            | variable
            | list
            | function
            | '{' expression '}'
            | object '[' key ']'
list -> '[' expression ']'
key -> number | string | boolean | '(' key ')' | key (','|'\n') key
boolean -> 'true' | 'false'
number
string
variable
'''
