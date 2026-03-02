# 2015 AMC 12B Problem 15

## Problem
At Rachelle's school, an A counts 4 points, a B 3 points, a C 2 points, and a D 1 point. Her GPA in the four classes she is taking is computed as the total sum of points divided by 4. She is certain that she will get A's in both Mathematics and Science and at least a C in each of English and History. She thinks she has a $\frac{1}{6}$ chance of getting an A in English, and a $\tfrac{1}{4}$ chance of getting a B. In History, she has a $\frac{1}{4}$ chance of getting an A, and a $\frac{1}{3}$ chance of getting a B, independently of what she gets in English. What is the probability that Rachelle will get a GPA of at least 3.5?

$\textbf{(A)}\; \frac{11}{72} \qquad\textbf{(B)}\; \frac{1}{6} \qquad\textbf{(C)}\; \frac{3}{16} \qquad\textbf{(D)}\; \frac{11}{24} \qquad\textbf{(E)}\; \frac{1}{2}$
## Solution 1
The probability that Rachelle gets a C in English is $1-\frac{1}{6}-\frac{1}{4} = \frac{7}{12}.$

The probability that she gets a C in History is $1-\frac{1}{4}-\frac{1}{3} = \frac{5}{12}.$

We see that the sum of Rachelle's "point" scores must be at least 14 since 4*3.5 = 14. We know that in Mathematics and Science we have a total point score of 8 (since she will get As in both), so we only need a sum of 6 in English and History. This can be achieved by getting two As, one A and one B, one A and one C, or two Bs. We evaluate these cases.

The probability that she gets two As is $\frac{1}{6}\cdot\frac{1}{4} = \frac{1}{24}.$

The probability that she gets one A and one B is $\frac{1}{6}\cdot\frac{1}{3} + \frac{1}{4}\cdot\frac{1}{4} = \frac{1}{18}+\frac{1}{16} = \frac{8}{144}+\frac{9}{144} = \frac{17}{144}.$

The probability that she gets one A and one C is $\frac{1}{6}\cdot\frac{5}{12} + \frac{1}{4}\cdot\frac{7}{12} = \frac{5}{72}+\frac{7}{48} = \frac{31}{144}.$

The probability that she gets two Bs is $\frac{1}{4}\cdot\frac{1}{3} = \frac{1}{12}.$

Adding these, we get $\frac{1}{24} + \frac{17}{144} + \frac{31}{144} + \frac{1}{12} = \frac{66}{144} = \boxed{\mathbf{(D)}\; \frac{11}{24}}.$
## Solution 2
We can break it up into three mutually exclusive cases: A in english, at least a C in history; B in english and at least a B in history; C in english and an A in history. This gives


$$\frac{1}{6} \cdot 1 + \frac{1}{4} \cdot \left(\frac{1}{3} + \frac{1}{4}\right) + \left(1 - \frac{1}{6} - \frac{1}{4}\right) \cdot \frac{1}{4} = \boxed{\textbf{(D)}\; \frac{11}{24}}.$$

## Solution 3 (Complementary Counting)
Probability she gets a B in English and C in History is $\frac{1}{4} \cdot \frac{5}{12} = \frac{5}{48}$

Probability she gets a C in English and B in History is $\frac{7}{12} \cdot \frac{1}{3} = \frac{7}{36}$

Probability she gets a C in English and C in History is $\frac{7}{12} \cdot \frac{5}{12} = \frac{35}{144}$

In total, the probability she gets any of these cases is $\frac{78}{144}.$ Therefore our answer is $1-\frac{78}{144} = \frac{66}{144} = \boxed{\textbf{(D)},}$ or $\frac{11}{24}$

*~SirAppel*
## Solution 4 (Quick)
Rachelle is certain that she will get an A in Math and Science. She will also get at least a C in both History and English. This means that her baseline GPA is 12. We make the observation that if she gets either an A in History or an A in English she will get a GPA of at least 3.5. However, she can also get a B in history and a B in English and still get a GPA of 3.5.

The probability that Rachelle gets an A in either History or English is 1 - $\frac$ {5}{6} $\cdot \frac$ {3}{4} = $\frac$ {3}{8}. The probability that Rachelle gets a B in both History an English is $\frac$ {1}{3} $\cdot \frac$ {1}{4} = $\frac$ {1}{12}. Summing the two gets the answer of $\boxed$ {$\textbf$ {(D)} $\frac$ {11}{24}}

*~Arcticturn*
## See Also
