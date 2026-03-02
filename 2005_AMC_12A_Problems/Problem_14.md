# 2005 AMC 12A Problem 14

## Problem
On a standard die one of the dots is removed at random with each dot equally likely to be chosen. The die is then rolled. What is the probability that the top face has an odd number of dots?


$$(\mathrm {A}) \ \frac{5}{11} \qquad (\mathrm {B}) \ \frac{10}{21} \qquad (\mathrm {C})\ \frac{1}{2} \qquad (\mathrm {D}) \ \frac{11}{21} \qquad (\mathrm {E})\ \frac{6}{11}$$

## Solutions
### Solution 1
There are $1 + 2 + 3 + 4 + 5 + 6 = 21$ dots total. [Casework](https://artofproblemsolving.com/wiki/index.php/Casework):

*The dot is removed from an even face. There is a $\frac{2+4+6}{21} = \frac{4}{7}$ chance of this happening. Then there are 4 odd faces, giving us a probability of $\frac 47 \cdot \frac 46 = \frac{8}{21}.$
*The dot is removed from an odd face. There is a $\frac{1+3+5}{21} = \frac{3}{7}$ chance of this happening. Then there are 2 odd faces, giving us a probability of $\frac 37 \cdot \frac 26 = \frac{1}{7}.$

Thus the answer is $\frac 8{21} + \frac 17 = \frac{11}{21} \Longrightarrow \mathrm{(D)}.$
### Solution 2 (Alcumus)
The probability that the top face is odd is 1/3 if a dot is removed from an odd face, and the probability that the top face is odd is 2/3 if a dot is removed from an even face. Because each dot has the probability 1/21 of being removed, the top face is odd with probability$\left(\frac{1}{3}\right)\left(\frac{1+3+5}{21}\right) +\left(\frac{2}{3}\right)\left(\frac{2+4+6}{21}\right) = \frac{33}{63} = \boxed{\frac{11}{21}}.$
## See also
