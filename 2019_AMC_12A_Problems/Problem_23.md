# 2019 AMC 12A Problem 23

## Problem
Define binary operations \diamondsuit and \heartsuit by a \, \diamondsuit \, $b =a^{\log_{7}(b)}\qquad \text{and} \qquad$ a \, \heartsuit \, $b =a^{\frac{1}{\log_{7}(b)}}$for all real numbers a and b for which these expressions are defined. The sequence $(a_n)$ is defined recursively by $a_3 = 3$\, \heartsuit\, 2 and $a_n$ = (n\, \heartsuit\, (n-1)) \,\diamondsuit\, $a_{n-1}$for all integers n $\geq 4.$ To the nearest integer, what is $\log_{7}(a_{2019})$?

$\textbf{(A) } 8 \qquad \textbf{(B) } 9 \qquad \textbf{(C) } 10 \qquad \textbf{(D) } 11 \qquad \textbf{(E) } 12$
## Solution 1
First note that by log properties a\diamondsuit $b =7^{(\log_7a)(\log_7b)}$ and a \heartsuit $b =7^{\frac{\log_7a}{\log_7b}}=7^{\log_ba}$.

Now, define $b_n=\log_7(a_n).$ Thus $b_3=\log_7($3\heartsuit 2) = $\log_7(7^{\log_23}) = \log_23.$

Taking logs of both sides of the recursion and using the definition of \diamondsuit gives $\log_7(a_n) = \log_7(7^{\log_7n\heartsuit (n-1)\log_7a_{n-1}}).$

The logs and the exponent cancel to  $\log_7((n$\heartsuit (n-$1))^{\log_7(a_{n-1})}$), and by the definition of \heartsuit, ths is $\log_7(7^{(\log_{n-1}n)\log_7(a_{n-1})}),$ which quickly simplifies to $\log_7(a_{n-1})\log_{n-1}$n  = $b_{n-1}\log_{n-1}$n.

Thus $b_n=b_{n-1}\log_{n-1}$n. From this, we have $b_$4 = b_$3\log_34 = \log_23\log_34 = \log_24,b_5=\log_45\log_24 = \log_25,$ and in general, $b_n=\log_2$n.

Finally, $\log_7(a_{2019}) =b_{2019}=\log_22019.$
Since $2^{11} = 2048$ and 2019 is slightly less than 2048, $\log_22019 \approx \boxed{\text{(D) }11}.$

- NamelyOrange
## Solution 2
By definition, the recursion becomes $a_n=\left(n^{\frac1{\log_7(n-1)}}\right)^{\log_7(a_{n-1})}=n^{\frac{\log_7(a_{n-1})}{\log_7(n-1)}}.$  By the change of base formula, this reduces to $a_n=n^{\log_{n-1}(a_{n-1})}$.  Thus, we have $\log_n(a_n) = \log_{n-1}(a_{n-1}).$  Thus, for each positive integer m $\geq 3,$ the value of $\log_m(a_m)$ must be some constant value k.

We now compute k from $a_3$.  It is given that $a_3 = $3\,\heartsuit\,$2 =3^{\frac1{\log_7(2)}}$, so $k =\log_3(a_3) = \log_3\left(3^{\frac1{\log_7(2)}}\right) = \frac1{\log_7(2)} = \log_2(7).$

Now, we must have $\log_{2019}(a_{2019}) =k =\log_2(7).$ At this point, we simply switch some bases around. For those who are unfamiliar with logarithms, we can turn the logarithms into fractions which are less intimidating to work with.


$$\frac{\log{a_{2019}}}{\log{2019}} = \frac{\log{7}}{\log{2}}\implies \frac{\log{a_{2019}}}{\log{7}} = \frac{\log{2019}}{\log{2}}\implies \log_7(a_{2019}) =\log_2(2019)$$


We conclude that $\log_7(a_{2019}) = \log_2(2019) \approx \boxed{11},$ or choice $\boxed{\text{D}}.$
## Solution 3
Using the recursive definition, $a_4$ = (4 \, \heartsuit \, 3) \, \diamondsuit\, (3 \, \heartsuit\, 2) or $a_4 = (4^{m})^{k}$ where $m =\frac{1}{\log_{7}(3)}$ and $k =\log_{7}(3^{\frac{1}{\log_{7}(2)}}).$ Using logarithm rules, we can remove the exponent of the 3 so that $k =\frac{\log_{7}(3)}{\log_{7}(2)}.$ Therefore, $a_4=4^{\frac{1}{\log_{7}(2)}}$, which is 4 \, \heartsuit \, 2.

We claim that $a_n$ = n \, \heartsuit \, 2 for all n $\geq 3.$ We can prove this through induction.

Clearly, the base case where $n = 3$ holds.

$$a_n = (n\, \heartsuit\, (n-1)) \,\diamondsuit\, ((n-1) \, \heartsuit \, 2)$$

This can be simplified as $a_n=(n^{\log_{n-1}(7)})$ \, \diamondsuit \, ((n-$1)^{\log_{2}(7)}$).

Applying the diamond operation, we can simplify $a_n= n^h$ where $h =\log_{n-1}(7) \cdot \log_{7}(n-1)^{\log_{2}(7)}.$ By using logarithm rules to remove the exponent of $\log_{7}(n-1)$ and after cancelling, $h =\frac{1}{\log_{7}(2)}.$

Therefore, $a_n=n^{\frac{1}{\log_{7}(2)}}$ = n \, \heartsuit \, 2 for all n $\geq 3,$ completing the induction.

We have $a_{2019}=2019^{\log_{2}(7)}$. Taking $\log_{2019}$ of both sides gives us {$\log_{2019}(a_{2019})$} = {$\log_{2}(7)$}. Then, by changing to base 7 and after cancellation, we arrive at {$\log_{7}(a_{2019})$} = {$\log_{2}(2019)$}. Because $2^{11} = 2048$ and $2^{10} = 1024$, our answer is $\boxed{\textbf{(D) } 11}.$
## Solution 4
We are given that

$$
a_n=(n\, \heartsuit\, (n-1)) \,\diamondsuit\, a_{n-1}
a_n=(n^{\frac{1}{\log_7(n-1)}})^{\log_7(a_{n-1})}
$$

Since we are asked to find $\log_7(a_{2019}),$ we directly apply
$$\log_7(a_n)=\log_7(n^{\frac{1}{\log_7(n-1)}})^{\log_7(a_{n-1})}$$
Using the property that $\log_ab^c=c\log_a$b
$$\log_7(a_n)=(\log_7a_{n-1})(\log_7(n^{\frac{1}{\log_7(n-1)}}))$$
Now using the property that $\frac{1}{\log_ab}=\log_b$a
$$\log_7(a_n)=(\log_7a_{n-1})(\log_7n^{\log_{n-1}7})$$
Once again applying the first property yields
$$\log_7(a_n)=(\log_7a_{n-1})(\log_{n-1}7)(\log_7n)$$
Rearranging the expression,
$$\log_7(a_n)=(\log_7n)(\log_{n-1}7)(\log_7a_{n-1})$$

Now expressing $\log_7a_{n-1}$ in a similar expression as $\log_7$a_n,


$$
\log_7(a_n)=(\log_7n)(\log_{n-1}7)(\log_7n-1)(\log_{n-2}7)(\log_7a_{n-2})
\log_7(a_n)=(\log_7n)(\log_{n-1}7)(\log_7n-1)(\log_{n-2}7)(\log_7n-2)(\log_{n-3}7)...(\log_74)(\log_37)(\log_7a_3)
$$


Because of the fact that ($\log_a$b)($\log_b$a)=1, we can cancel out the terms to get


$$
\log_7(a_n)=(\log_7n)(\log_37)(\log_7a_3)
\log_7(a_n)=(\log_7n)(\log_37)(\log_7(3^{\frac{1}{\log_72}}))
\log_7(a_n)=(\log_7n)(\log_37)(\log_27)(\log_73)
\log_7(a_n)=(\log_27)(\log_7n)
$$


Using the Chain Rule for Logarithm, ($\log_a$b)($\log_b$c)=$\log_a$c, yields

$$\log_7(a_n)=(\log_2n)$$
Finally, substituting in $n=2019$, we have

$$
\log_7(a_{2019})=(\log_22019)
\log_7(a_{2019})\approx11\boxed{\mathrm{(D)}}
$$


*~Nafer*
### Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2019amc12a/495

*~dolphin7*
## See Also
