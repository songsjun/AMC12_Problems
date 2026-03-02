# 2005 AMC 12B Problem 13

## Problem
Suppose that $4^{x_1}=5, 5^{x_2}=6, 6^{x_3}=7, ... , 127^{x_{124}}=128$.  What is $x_1x_2...x_{124}$?


$$\mathrm{(A)}\ } \qquad \mathrm{(B)}\ {{{\frac{5}{2}}}} \qquad \mathrm{(C)}\ } \qquad \mathrm{(D)}\ {{{\frac{7}{2}}}} \qquad \mathrm{(E)}\ }$$

## Solution
We see that we can re-write $4^{x_1}=5, 5^{x_2}=6, 6^{x_3}=7, ... , 127^{x_{124}}=128$ as $\left(...\left(\left(\left(4^{x_1}\right)^{x_2}\right)^{x_3}\right)...\right)^{x_{124}}=128$ by using substitution. By using the properties of exponents, we know that $4^{x_1x_2...x_{124}}=128$.


$$4^{x_1x_2...x_{124}}=128\\2^{2x_1x_2...x_{124}}=2^7\\2x_1x_2...x_{124}=7\\x_1x_2...x_{124}=\dfrac{7}{2}$$


Therefore, the answer is $\boxed{\mathrm{(D)}\,\dfrac{7}{2}}$
## Alternate Solution
Changing $4^{x_1}=5$ to logarithmic form, we get {$x_1}=\log_{4}{5}.$  We can rewrite this as {$x_1}=\dfrac{\log{5}}{\log{4}}.$  Applying this to the rest, we get $x_1x_2...x_{124}=\dfrac{\log5}{\log4}\cdot\dfrac{\log6}{\log5}\cdot...\cdot\dfrac{\log128}{\log127}=\dfrac{\log5\cdot\log6\cdot...\cdot\log128}{\log4\cdot\log5\cdot...\cdot\log127}=\dfrac{\log128}{\log4}=\log_{4}{128}=\log_{4}{2^7}=7\cdot\log_{4}{2}=7\cdot\dfrac{1}{2}=\boxed{\mathrm{(D)}\,\dfrac{7}{2}}$
## See also
