# 2020 AMC 12B Problem 13

## Problem
Which of the following is the value of $\sqrt{\log_2{6}+\log_3{6}}$?

$\textbf{(A) } 1 \qquad\textbf{(B) } \sqrt{\log_5{6}} \qquad\textbf{(C) } 2 \qquad\textbf{(D) } \sqrt{\log_2{3}}+\sqrt{\log_3{2}} \qquad\textbf{(E) } \sqrt{\log_2{6}}+\sqrt{\log_3{6}}$
## Solution 1 (Properties of Logarithms)
Recall that:

$$1.   \log_b{(uv)}=\log_b u + \log_b v.$$

$$2.   \log_b u\cdot\log_u b=1.$$

We use these properties of logarithms to rewrite the original expression:

$$
\begin{align*} \sqrt{\log_2{6}+\log_3{6}}&=\sqrt{(\log_2{2}+\log_2{3})+(\log_3{2}+\log_3{3})} \\ &=\sqrt{2+\log_2{3}+\log_3{2}} \\ &=\sqrt{\left(\sqrt{\log_2{3}}+\sqrt{\log_3{2}}\right)^2} \\ &=\boxed{\textbf{(D) } \sqrt{\log_2{3}}+\sqrt{\log_3{2}}}. \end{align*}
$$

*~MRENTHUSIASM (Solution)*

*~JHawk0224 (Proposal)*
## Solution 2 (Change of Base Formula)
First,

$$\sqrt{\log_2{6}+\log_3{6}} = \sqrt{\frac{\log{6}}{\log{2}} + \frac{\log{6}}{\log{3}}} = \sqrt{\frac{\log{6}\cdot\log{3} + \log{6}\cdot\log{2}}{\log{3}\cdot\log{2}}} = \sqrt{\frac{\log{6}(\log 2 + \log 3)}{\log 2\cdot \log 3}}.$$

From here,

$$
\begin{align*}\sqrt{\frac{\log{6}(\log 2 + \log 3)}{\log 2\cdot \log 3}} &= \sqrt{\frac{(\log 2 + \log 3)(\log 2 + \log 3)}{\log 2\cdot \log 3}} &= \sqrt{\frac{(\log 2 + \log 3)^2}{\log 2\cdot \log 3}} &= \frac{\log 2}{\sqrt{\log 2\cdot\log 3}} + \frac{\log 3}{\sqrt{\log 2\cdot\log 3}} \\ &= \sqrt{\frac{\log 2}{\log 3}} + \sqrt{\frac{\log 3}{\log 2}} \\ &= \sqrt{\log_3 2} + \sqrt{\log_2 3}. \end{align*}
$$

Answer: $\boxed{\textbf{(D) } \sqrt{\log_2{3}}+\sqrt{\log_3{2}}}$

Note that in this solution, even the most minor steps have been written out. On the actual test, this solution would be quite fast, and much of it could easily be done in your head.

*~TheBeast5520*

*~LeonidasTheConquerer (removed unnecessary steps)*
## Solution 3 (Observations)
Using the knowledge of the powers of 2 and 3, we know that $\log_2{6}>2.5$ and $\log_3{6}>1.5.$ Therefore, $\sqrt{\log_2{6}+\log_3{6}}>\sqrt{2.5+1.5}=2.$ Only choices $\textbf{(D)}$ and $\textbf{(E)}$ are greater than 2, but $\textbf{(E)}$ is certainly incorrect: If we compare the squares of the original expression and $\textbf{(E)},$ then they are clearly not equal. So, the answer is $\boxed{\textbf{(D) } \sqrt{\log_2{3}}+\sqrt{\log_3{2}}}.$

*~Baolan*

*~Solasky (first edit on wiki!)*

*~chrisdiamond10*

*~MRENTHUSIASM (reformatted and merged the thoughts of all contributors)*
## Solution 4 (Solution 3 but More Detailed)
Note: Only use this method if all else fails and you cannot find a way to simplify the logarithms.

We can see that $\log_2{6}$ is greater than 2 and less than 3. Additionally, since 6 is halfway between $2^2$ and $2^3,$ knowing how exponents increase more the larger x is, we can deduce that $\log_2{6}$ is just above halfway between 2 and 3. We can guesstimate this as $\log_2{6} \approx 2.55. ($It's actually about 2.585.)

Next, we think of $\log_3{6}.$ This is greater than 1 and less than 2. As 6 is halfway between $3^1$ and $3^2,$ and similar to the logic for $\log_2{6},$ we know that $\log_3{6}$ is just above halfway between 1 and 2. We guesstimate this as $\log_3{6} \approx 1.55. ($It's actually about 1.631.)

So, $\log_2{6} + \log_3{6}$ is approximately 4.1. The square root of that is just above 2, maybe 2.02. We cross out all choices below $\textbf{(C)}$ since they are less than 2, and $\textbf{(E)}$ can't possibly be true unless either $\log_2{6}$ and/or $\log_3{6}$ is 0 (You can prove this by squaring.). Thus, the only feasible answer is $\boxed{\textbf{(D) } \sqrt{\log_2{3}}+\sqrt{\log_3{2}}}.$

*~PureSwag*
## Video Solution (HOW TO THINK CREATIVELY!!!)
https://youtu.be/ObLQiTVxLco

*~Education, the Study of Everything*

(This solution is wrong as it involves an identity that is not true ~pengf)
## Video Solution by TheBeautyOfMath
https://youtu.be/0xgTR3UEqbQ
## Video Solution by Sohil Rathi
https://youtu.be/RdIIEhsbZKw?t=1463

https://youtu.be/GmUWIXXf_uk?t=1298
## See Also
