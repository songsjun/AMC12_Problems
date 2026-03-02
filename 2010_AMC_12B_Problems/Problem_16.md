# 2010 AMC 12B Problem 16

> This problem is the same as [2010 AMC 12B #16](https://artofproblemsolving.com/wiki/index.php/2010_AMC_12B_Problems) and [2010 AMC 10B #18](https://artofproblemsolving.com/wiki/index.php/2010_AMC_10B_Problems).
## Problem
Positive integers a, b, and c are randomly and independently selected with replacement from the set $\{1, 2, 3,\dots, 2010\}$. What is the probability that abc + ab + a is divisible by 3?

$\textbf{(A)}\ \dfrac{1}{3} \qquad \textbf{(B)}\ \dfrac{29}{81} \qquad \textbf{(C)}\ \dfrac{31}{81} \qquad \textbf{(D)}\ \dfrac{11}{27} \qquad \textbf{(E)}\ \dfrac{13}{27}$
## Solution 1
We group this into groups of 3, because 3|2010. This means that every residue class mod 3 has an equal probability.

If 3|a, we are done. There is a probability of $\frac{1}{3}$ that that happens.

Otherwise, we have 3|bc+$b+1$, which means that b($c+1) \equiv 2\pmod{3}.$ So either b $\equiv 1 \pmod{3},$ c $\equiv 1 \pmod{3}$ or b $\equiv 2 \pmod$ {3}, c $\equiv 0 \pmod 3$ which will lead to the property being true. There is a $\frac{1}{3}\cdot\frac{1}{3}=\frac{1}{9}$ chance for each bundle of cases to be true. Thus, the total for the cases is $\frac{2}{9}.$ But we have to multiply by $\frac{2}{3}$ because this only happens with a $\frac{2}{3}$ chance. So the total is actually $\frac{4}{27}.$

The grand total is $\frac{1}{3} + \frac{4}{27} = \boxed{\text{(E) }\frac{13}{27}.}$
## Solution 2 (Minor change from Solution 1)
Just like solution 1, we see that there is a $\frac{1}{3}$ chance of 3|a and $\frac{2}{9}$ chance of 3|1+b+bc

Now, we can just use PIE (Principles of Inclusion and Exclusion) to get our answer to be $\frac{1}{3}+\frac{2}{9}-\frac{1}{3}\cdot\frac{2}{9} = \boxed{\text{(E) } \frac{13}{27}}$

*~Conantwiz2023*
## Solution 3 (Fancier version of Solution 1)
As with solution one, we conclude that if $a\equiv0\mod 3$ then the requirements are satisfied. We then have:

$$
a(bc+c)+a\equiv0 \mod 3
a(bc+c)\equiv-a \mod 3
c(b+1)\equiv-1 \mod 3
b+1\equiv \frac{-1}{c} \mod 3
$$

Which is true for one b when $c\not\equiv 0 \mod 3$ because the integers$\mod 3$ form a field under multiplication and addition with absorbing element 0.

This gives us P=$\frac{1}{3}+\frac{4}{27}=\boxed{\text{(E) }\frac{13}{27}}.$

*~Snacc*
## Video Solution
https://youtu.be/FQO-0E2zUVI?t=437

*~IceMatrix*
## See also
