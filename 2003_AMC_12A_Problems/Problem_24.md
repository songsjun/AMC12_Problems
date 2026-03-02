# 2003 AMC 12A Problem 24

## Problem
If $a\geq$ b > 1, what is the largest possible value of $\log_{a}(a/b) + \log_{b}(b/a)$?


$$\mathrm{(A)}\ -2 \qquad \mathrm{(B)}\ 0 \qquad \mathrm{(C)}\ 2 \qquad \mathrm{(D)}\ 3 \qquad \mathrm{(E)}\ 4$$

## Solution 1
Using logarithmic rules, we see that


$$
\log_{a}a-\log_{a}b+\log_{b}b-\log_{b}a = 2-(\log_{a}b+\log_{b}a)
=2-\left(\log_{a}b+\frac {1}{\log_{a}b}\right)
$$


Since a and b are both greater than 1, using [AM-GM](https://artofproblemsolving.com/wiki/index.php/AM-GM) gives that the term in parentheses must be at least 2, so the largest possible values is $2-2=0\Rightarrow \boxed{\textbf{B}}.$

Note that the maximum occurs when a=b.
## Solution 2 (Calculus)
By the logarithmic rules, we have 2-($\log_a{b}+\frac{1}{\log_a{b}}).$
Let $x=\log_a{b}.$ Thus, the expression becomes 2-($x+\frac{1}{x}).$ We want to find the maximum of the function. To do so, we will find its derivative and let it equal to 0. We get: $\frac{d}{dx}$\big(2-($x+\frac{1}{x})$\big)=$\frac{d}{dx}$\big($2-x-\frac{1}{x})=-1+x^{-2}=0 \implies \frac{1}{x^2}=1,x^2=1,x=\pm1.$
Since $a\geq$ b>1, x=-1 is not a solution. Thus, $x=1$. Substituting it into the original expression 2-($x+\frac{1}{x}),$ we get 2-($1+\frac{1}{1})=2-2=\boxed{0}.$
## Video Solution
The Link: https://www.youtube.com/watch?v=InF2phZZi2A&t=1s

*~MistyMathMusic*
## See Also
