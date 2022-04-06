# lol I do this so that none of these vars throw errors
my,name,jeff,hello,ben,kern,is,very,cool,great,nice,sweet,hi = "Corgi Time"

f = fn:
    my name jeff
    hello

### I had to comment this out so that it would actually run since its not going to recognize strings being put together with strings

ben kern is very
  cool and
    great
      and
        nice
    and cool
                       and sweet

  hello
  
# hi

  hello
    #hello
    hello
        # hello
    hi

  
# Should be parsed as:
# ben kern is very (cool and (great (and (nice))) (and cool (and sweet))) (hello) (hello (hello) (hi))