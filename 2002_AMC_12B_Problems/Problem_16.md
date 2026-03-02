# 2002 AMC 12B Problem 16

## Problem
Juan rolls a fair regular [octahedral](https://artofproblemsolving.com/wiki/index.php/octahedron) die marked with the numbers 1 through 8. Then Amal rolls a fair six-sided die. What is the [probability](https://artofproblemsolving.com/wiki/index.php/probability) that the product of the two rolls is a multiple of 3?


$$\mathrm{(A)}\ \frac 1{12} \qquad\mathrm{(B)}\ \frac 13 \qquad\mathrm{(C)}\ \frac 12 \qquad\mathrm{(D)}\ \frac 7{12} \qquad\mathrm{(E)}\ \frac 23$$

## Solution
### Solution 1
On both dice, only the faces with the numbers 3,6 are divisible by 3. Let P(a) = $\frac{2}{8} = \frac{1}{4}$ be the probability that Juan rolls a 3 or a 6, and P(b) = $\frac{2}{6} = \frac 13$ that Amal does. By the [Principle of Inclusion-Exclusion](https://artofproblemsolving.com/wiki/index.php/Principle_of_Inclusion-Exclusion),


$$P(a \cup b) = P(a) + P(b) - P(a \cap b) = \frac{1}{4} + \frac{1}{3} - \frac{1}{4} \cdot \frac{1}{3} = \frac{1}{2} \Rightarrow \mathrm{(C)}$$


Alternatively, the probability that Juan rolls a multiple of 3 is $\frac{1}{4},$ and the probability that Juan does not roll a multiple of 3 but Amal does is $\left(1 - \frac{1}{4}\right) \cdot \frac{1}{3} = \frac{1}{4}.$ Thus the total probability is $\frac 14 + \frac 14 = \frac 12.$
### Solution 2
The probability that neither Juan nor Amal rolls a multiple of 3 is $\frac{6}{8} \cdot \frac{4}{6} = \frac{1}{2}$; using [complementary counting](https://artofproblemsolving.com/wiki/index.php/complementary_counting), the probability that at least one does is 1 - $\frac 12 = \frac 12 \Rightarrow \mathrm{(C)}.$
### Solution 3 (Alcumus)
The product will be a multiple of 3 if and only if at least one of the two rolls is a 3 or a 6. The probability that Juan rolls 3 or 6 is $2/8 = 1/4$. The probability that Juan does not roll 3 or 6, but Amal does is (3/4) (1/3) = 1/4. Thus, the probability that the product of the rolls is a multiple of 3 is $\frac{1}{4} + \frac{1}{4} = \boxed{\frac{1}{2}}.$
*~aopsav (Credit to AoPS Alcumus)*
## See also
